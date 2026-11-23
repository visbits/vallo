# Vallo prototype design

Status: Draft. Nothing in this document is implemented. The website
([WEBSITE.md](WEBSITE.md)) is a marketing concept with simulated controls; this
document describes how the real product would work if we built it. Choices
marked *proposed* are defaults for the prototype, not commitments. Recording
this design does not authorize implementation, deployment, or security changes.

Inputs: the November 04 customer integration feedback, the
[November 05 customer interview](dan-alaqmar-chat.txt), and a local spike on
2026-11-23 confirming that `cloudflared tunnel --url` (version 2026.10.2)
exposes a local HTTP service at a public `*.trycloudflare.com` URL within
seconds.

## 1. What the prototype does

A customer installs the Vallo GitHub App on a repository. From then on, every
push to a branch produces a working, isolated, full-stack environment for that
branch: the code is built, deployed with its dependencies, tested, and exposed
through a temporary URL. Results appear on the commit and pull request.

**Push -> resolve revision -> build -> allocate environment -> deploy -> wait for
readiness -> test -> expose preview URL -> report -> retain or destroy.**

Design principles:

1. **Deterministic execution.** Routine runs are executed by a controller using
   ordinary tools (Terraform/OpenTofu, Helm, shell). No LLM is involved in a
   normal run, so runs are cheap, repeatable, and auditable.
2. **Agents author and repair, they do not operate.** An agent writes or fixes
   the blueprint and infrastructure code. Once reviewed, the controller runs it.
3. **Provider-neutral.** Blueprints state requirements; adapters map them onto
   the Nirvana API first, then OpenStack, AWS, or others.
4. **Everything is a record.** Runs, jobs, release records, and evidence are
   durable and replayable, independent of any agent session.

## 2. Architecture

```
GitHub ──webhook──> Gateway ──> Run queue ──> Controller ──> Provider adapter ──> Infrastructure
                      │             │             │  │                              (Nirvana / OpenStack / AWS / Docker)
                      │             │             │  └─> Terraform/OpenTofu runner (state in object storage)
                      │             │             └────> Tunnel manager ──> Cloudflare API
                      │             │             └────> Evidence store (object storage)
                      │             └─ Postgres (runs, jobs, environments, releases)
                      └─ Check Runs / PR comments / Deployments API
                                     Repair agent (invoked only on non-transient failures)
```

| Component | Responsibility |
| --- | --- |
| Gateway | Receives GitHub webhooks, verifies the HMAC signature, dedupes on delivery ID, enqueues runs. Stateless. |
| Run queue and store | Durable run/job state in Postgres. A run is keyed by repository, branch, and commit SHA. |
| Controller | Reconciliation loop. Advances runs through stages, enforces quotas, budgets, leases, and cancellation. Restart-safe. |
| Runner | Executes jobs (build, Terraform, deploy, test) in disposable, isolated workers with per-run credentials. |
| Provider adapter | Narrow interface over the infrastructure API (see section 6). |
| Tunnel manager | Creates, configures, and deletes Cloudflare tunnels and DNS records for environments (section 7). |
| Evidence store | Logs, test reports, Kubernetes events, plan output, artifacts, and release records in object storage. |
| Repair agent | Optional LLM worker that reads an evidence bundle and proposes a branch with a fix (section 9). |

*Proposed* implementation: a single Go service (gateway and controller) with
Postgres and S3-compatible object storage; runners are short-lived containers
or VMs launched through the provider adapter.

## 3. Domain model

| Concept | Description |
| --- | --- |
| Project | A connected GitHub repository, its installation, policies, quotas, and default blueprint path |
| Component/profile | Versioned unit: runtime/image, inputs/outputs, dependencies, resources, readiness, network needs, cleanup |
| Blueprint | Components plus build/deploy/test steps, dependencies, and configuration references; lives in the repo as `vallo.yml` |
| Release record | Immutable, checksummed resolution of a blueprint: commits, image digests, seed versions, module versions |
| Environment | Allocated machines/clusters/data/services with an owner, isolation boundary, lease, and optional preview URL |
| Run | One invocation for a commit: resolved inputs, policy, budget, jobs, outcome |
| Job | Bounded attempt: status, inputs, outputs, timeout, cancellation |
| Evidence bundle | Durable facts and artifact references for a run |

Run states: `queued -> resolving -> building -> provisioning -> deploying ->
ready -> testing -> {passed | failed | errored | cancelled} -> retained | destroyed`.
Distinguish acceptance, allocation, readiness, execution completion, and cleanup
completion; cancellation does not prove cleanup succeeded.

Identity rules: run and job IDs are durable; a duplicate delivery or controller
restart reattaches to existing resources rather than creating new ones. Every
resource is tagged with its environment ID so a reconciler can find orphans.

## 4. Blueprint format

*Proposed* repo file `vallo.yml` (schema versioned; the final language is not
selected). It references existing assets rather than replacing them.

```yaml
version: 1
environment:
  profile: k8s-small          # capability request, not a provider SKU
  seed: node-postgres@v3      # optional prepared starting point
  ttl: 4h
  idle_ttl: 30m
build:
  - name: web
    dockerfile: Dockerfile
    image: ghcr.io/acme/web
infrastructure:
  terraform: infra/preview    # Terraform/OpenTofu root module
deploy:
  - helm: charts/app
    values: charts/app/preview.yaml
    ready: { deployment: web, timeout: 5m }
expose:
  - name: web
    service: web:8080
    visibility: protected     # protected (Access gated) | public
tests:
  - name: smoke
    run: npm run test:e2e -- --base-url "$VALLO_PREVIEW_URL"
    timeout: 10m
secrets:
  safe: [STRIPE_API_KEY]      # user-supplied references, never values
  test: [DB_PASSWORD]         # generated per environment, destroyed with it
outcomes:                     # user-confirmed definition of "working" (section 7A)
  - name: api-healthy
    http: { url: "${web}/healthz", status: 200 }
```

Separate the editable source (the file in the branch) from the resolved release
record produced for each run. Secrets are references, never values.

## 5. Execution engine

Agent-only orchestration is rejected: it burns tokens on repeatable work, is
non-deterministic, and is hard to audit.

| Layer | Tool | Role |
| --- | --- | --- |
| Infrastructure | Terraform or OpenTofu | Declarative machines, networks, volumes, clusters, DNS; reviewable plans |
| Machine config | Baked seed images and cloud-init; Ansible only for unavoidable imperative or legacy setup | Prefer immutable seeds over run-time configuration |
| Application deploy | Helm, Kubernetes manifests, Compose, or customer scripts | Reuse customer assets |
| Sequencing and policy | Vallo controller | Run state, readiness gates, tests, evidence, budgets, leases, teardown |

Rules:

- Terraform state is remote, locked, encrypted, and has exactly one owner per
  environment. State may contain credentials and is treated as sensitive.
- Terraform is declarative and does not replace the controller. Readiness
  waits, tests, evidence collection, and teardown ordering stay in the
  controller.
- Modules and provider versions are pinned in the release record. Replay
  re-applies the pinned definitions, never newer ones.
- Terraform versus OpenTofu is undecided (licensing, provider support).

## 6. Provider interoperability

The controller talks to infrastructure only through adapters.

```
Adapter {
  Capabilities() -> {cow_clones, snapshots, stable_egress, shared_files, k8s, ...}
  CreateEnvironment(spec) -> envID            // async; poll Inspect
  Inspect(envID) -> {state, resources[], errors[]}
  Snapshot(envID) -> snapshotID               // async; Ready/Failed observable
  Restore(snapshotID, spec) -> envID
  ExposePort(envID, port, visibility) -> endpoint   // or defer to tunnel manager
  Meter(envID) -> usage[]
  Destroy(envID)                              // idempotent, retryable
}
```

- Normalize errors and resource identities across providers. An accepted
  request is not a completed one; adapters must surface asynchronous failures.
- Capabilities are declared per provider. A blueprint requiring a missing
  capability fails at preflight instead of mid-deploy.
- **First adapter: the Nirvana API.** Its endpoints, authentication, and
  primitives must be captured from the customer before implementation;
  they are not assumed here. Known customer-reported gaps are in section 11.
- **Next candidates: OpenStack** (Nova, Neutron, Glance, Cinder, Keystone,
  Manila) and **AWS**. Where a Terraform provider exists the adapter may
  delegate to it; otherwise it calls the API directly.
- A local **Docker adapter** exists for development and the first spike.
- Full portability is a goal, not a promise: differing capabilities are
  expected.

## 7. GitHub to deployment to preview URL

### 7.1 Trigger

A GitHub App subscribes to `push`, `pull_request`, and `delete`. Permissions
are least-privilege: read contents and metadata; write checks, deployments, and
pull requests. The gateway verifies the signature, dedupes by delivery ID,
creates a run for `(repo, branch, sha)`, and cancels any in-flight run for the
same branch. Fork PRs run without secrets and without a public preview unless
the maintainer approves.

### 7.2 Run

1. Resolve the exact revision: the pushed commit plus pinned baselines for
   other repositories, with explicit overrides. Never test against a moving
   main branch silently.
2. Fetch `vallo.yml` at that commit using a short-lived installation token.
3. Build images and artifacts; record digests.
4. One environment per branch, named from the repo, branch slug, and branch ID.
   A new push updates the existing environment; the first push creates it.
5. `plan` and `apply` the infrastructure module via the provider adapter;
   deploy dependencies and the application; wait for declared readiness.
6. Start tunnels and publish the preview URL (section 7.3).
7. Run tests as jobs; collect results, logs, Kubernetes events, and artifacts.
8. Post a Check Run and Deployment status containing the URL and evidence links.
9. Destroy on branch deletion, PR close or merge, lease expiry, or idle TTL, or
   retain temporarily for debugging under an explicit retention policy.

### 7.3 Cloudflare tunnels

Each environment runs a `cloudflared` connector (a sidecar, pod, or VM service).
Outbound-only connections mean no inbound firewall changes are needed; the
network must allow egress to Cloudflare on port 7844.

- **Quick tunnels** (`cloudflared tunnel --url http://localhost:PORT`): no
  account, no domain, a random `trycloudflare.com` URL. Cloudflare documents
  them as for testing and development with no uptime guarantee; URLs change on
  every start and are open to anyone with the link unless `--allowed-mail`
  restricts access by emailed one-time PIN. Use for the first prototype.
- **Named tunnels via API** (production path), controller-driven:
  1. `POST /accounts/{id}/cfd_tunnel` with `config_src: cloudflare` returns the
     tunnel ID and token.
  2. `PUT /accounts/{id}/cfd_tunnel/{tunnel}/configurations` sets ingress
     rules: hostname to local service, ending with a catch-all
     `http_status:404`.
  3. Create a DNS CNAME `<branch>-<id>.preview.vallo.io` to
     `<tunnel>.cfargotunnel.com`.
  4. Pass only the per-tunnel token to the environment's `cloudflared`.
  Keep hostnames single-level to avoid extra certificates. Required API token
  scope: Account Cloudflare Tunnel Edit and Zone DNS Edit, held only by the
  controller.
- **Access control:** `protected` previews sit behind Cloudflare Access with
  the customer's chosen identity rule. `public` previews are opt-in, short
  lived, and rate limited.
- **Cleanup:** destroying an environment deletes its tunnel and DNS record. A
  periodic reconciler removes orphaned tunnels and records.

### 7.4 Security boundaries

- Webhook payloads are untrusted until the signature is verified.
- Branch code is untrusted. It never receives the controller's long-lived
  provider, Cloudflare, or GitHub credentials; only per-run, least-privilege,
  short-lived ones.
- Environments are isolated from each other, from the management network,
  and from platform credentials. Control endpoints (agent, runner) are never
  exposed through preview tunnels; only ports declared in `expose`.
- Public previews of untrusted code are an abuse and phishing vector: gate by
  default, enforce TTLs, apply rate limits, and keep a takedown path.

## 7A. First-time onboarding: discovery, configuration, and verification

The one place an agent does substantial work. It turns an unknown repository
into a committed, working blueprint. Later pushes use that blueprint
deterministically (section 7).

### Step by step

1. **Connect.** The user installs the GitHub App and selects the repository.
   The controller creates an onboarding run: a long-lived run with a token
   budget, a time limit, and an attempt cap.
2. **Discovery sandbox.** All discovery and experimentation happens inside a
   dedicated, disposable sandbox environment, never on the controller. The
   sandbox has no platform credentials, filtered egress, and a hard TTL. The
   agent may break it freely; destroying it is the recovery path.
3. **Infrastructure toolbox.** The agent reaches the infrastructure only through
   a scoped toolbox over the provider adapter: create, inspect, snapshot, and
   destroy environments, expose ports, run commands, read logs. Every call goes
   through the controller, which enforces quotas and tags resources with the run
   ID. The agent's credentials expire with the sandbox.
4. **Understand the code.** The repository is cloned at a pinned SHA.
   Deterministic scanners run first and cost no tokens: languages, lockfiles,
   Dockerfiles, Compose files, Helm charts, Terraform, CI workflows, Makefile
   targets, `.env.example`, listening ports. The agent then reads only what the
   scan points to, plus the README and CI config. Output is a **findings
   file**: services, build and run commands, dependencies (databases, queues),
   required configuration and secrets, ports, health endpoints, and how tests
   run. Unknowns go to a **questions list**; the agent never invents
   credentials or undocumented dependencies.
5. **Draft the configuration.** The agent writes `vallo.yml` and any Terraform,
   Helm, or Compose files on a branch such as `vallo/onboarding`, reusing
   existing working assets by reference where possible.
6. **Deploy and test until it works.** Each attempt is an ordinary controller
   run (plan, apply, deploy, wait for readiness, run checks) logged as
   structured evidence. On failure the agent edits the configuration and
   retries.
7. **Hand off.** The user receives a PR comment and dashboard summary: preview
   URL (Access-gated), what was deployed and what each service does, what the
   agent had to change, open questions, and outcome results with evidence
   links. A troubleshooting chat can inspect the live environment through the
   same scoped toolbox; fixes go through the loop as a branch and a rerun.
8. **Persist and version.** The accepted configuration is committed to the
   user's repository through a PR they review and merge; the repository stays
   the source of truth. Each green run also writes an immutable release record
   (section 8) marked passed or failed.

### Loop limits and termination

Guardrails: attempt cap (for example 8), token and time budgets, a no-progress
detector (the same error signature repeated, or no change in outcome results
across consecutive attempts), and the existing bans on weakening tests,
widening permissions, merging, or touching protected environments.

The loop ends in one of three states:

- **Verified:** every user-defined expected outcome passes.
- **Application fault:** the evidence shows the code is at fault (crash on boot,
  failing test, missing migration). Report it with evidence; do not paper over
  it. "Deploys but fails its tests" is a valid, useful result.
- **Needs the user:** a missing safe secret, an unanswered question, or an
  outcome the agent cannot verify.

### Expected outcomes define "working"

Vallo does not guess what correct looks like. Progress and completion are
measured against **expected outcomes supplied by the user** during onboarding.
The agent can propose candidates from the findings (a health endpoint returns
200, the homepage renders, the existing test suite passes), but the user
confirms or edits them before they count.

```yaml
outcomes:
  - name: api-healthy
    http: { url: "${web}/healthz", status: 200 }
  - name: login-page
    http: { url: "${web}/login", status: 200, contains: "Sign in" }
  - name: unit-tests
    run: npm test
    expect: exit_0
  - name: signup-flow
    run: npm run test:e2e
    expect: exit_0
```

Rules:

- Outcomes are declarative and machine-checkable (HTTP check, command exit
  status, query result, file or log expectation). No outcomes means no
  "verified" state: the run can only report "deployed and healthy" at best.
- The no-progress detector counts how many outcomes pass each attempt, so
  progress is measurable. Outcomes only the user can judge (for example visual
  correctness) are marked `manual` and are confirmed by the user through the
  preview URL.
- Outcomes live in the committed `vallo.yml`. Changing or removing them is a
  reviewed change; the agent cannot edit them to turn a failure into a pass.

### Secrets: two classes

| Class | Examples | Source | Lifetime | Agent visibility |
| --- | --- | --- | --- | --- |
| Safe secrets | Real external API keys, integration tokens, production-grade credentials | Supplied by the user through a vault UI or the GitHub/organization secret store; stored as references | Persist until the user rotates or removes them | Names and scopes only, never values |
| Test secrets | Throwaway database passwords, generated tokens, test accounts, local-only keys | Generated by the controller (or a seed/fixture) per environment | Created at run start, destroyed when the run or environment ends | Values may be visible inside the sandbox where required to run it |

Rules:

- **Safe secrets** are never pasted into chat or committed. They are injected by
  the controller into a specific environment as runtime environment variables
  or mounted files, scoped per environment, branch pattern, and job. They are
  not injected into fork PRs, into discovery sandboxes (which use test secrets
  and stubs/mocks of external services), or into any run the user has not
  allowed. The agent sees only that a secret named `X` exists and where it is
  required.
- **Test secrets** exist only to make an environment function and are
  discarded when the test completes. They are generated, never reused across
  environments, never written into the release record, and revoked by teardown
  (destroying the environment and its volumes).
- Findings that need a safe secret become entries in the questions list; the user
  adds it once and the blueprint references it by name.
- External integrations reached with safe secrets are real side effects. Mark
  them in the blueprint (`side_effects: external`) so retries and the repair loop
  treat them as not safe to repeat blindly, and let the user choose to run
  against sandbox/test endpoints instead.
- Terraform state and logs are scrubbed of safe-secret values; evidence applies
  redaction before storage.

## 8. Release records, replay, and rollback

Publishing a run resolves a blueprint into an immutable record in versioned
object storage: unique ID, creation time, schema version, integrity checksum.
Previous records are kept.

A record contains:

- Each repository's identity, tag or label where applicable, and exact commit.
- Each built image's version, digest, and platform. Retain the built artifacts;
  rebuilding an old commit may not reproduce identical contents.
- Versioned deployment definitions, charts, infrastructure modules, dependency
  locks, provider and toolchain versions.
- Non-secret configuration, component relationships, resource requirements,
  deployment order, readiness gates, test commands, and validation criteria.
- Immutable seed/data snapshot references with checksums.
- Secret references only; never credentials, tokens, kubeconfigs, or raw
  Terraform state.
- Links to the run, outcome, and evidence. Record which releases actually
  passed validation; a failed deployment is not a rollback point.

Replay: fetch the record, verify its integrity and artifact availability, check
target capabilities and permissions, and produce an exact plan before executing.
Missing artifacts or runtimes produce explicit blockers, never silent newer
substitutes. Rollback compares the current environment with a selected release
and produces the restoring formula, preferably reconstructed in an isolated
environment first. Selecting a release does not authorize destructive operations.

Deployment replay is not data recovery. Migrations can block older code from
current data; identify compatibility, required snapshots, and possible loss
before calling a rollback executable. Process memory and external side effects
are not restored. Rotated credentials resolve under current authorization.

Retention and garbage collection must cover blueprints, Git source, images,
seeds, and dependencies together; object storage alone does not preserve a
commit or stop a registry from deleting an image.

## 9. Failure handling and the agent repair loop

Failures are captured as structured events: failing step, exit status,
Terraform and provider errors, Kubernetes events, logs, and the revision set.

1. **Deterministic classification first** (no agent): quota exhaustion,
   timeouts, known provider errors, provisioning failure versus test failure.
2. **Transient failures** retry under a declared policy with backoff.
3. **Non-transient failures** may go to the repair agent under customer policy:
   - Report only.
   - Diagnose and suggest a fix.
   - Fix on a branch, rerun validation, open a PR.
   - Notify through Slack instead of changing code.
4. The agent proposes changes to Terraform, the blueprint, or application code
   on a branch. The controller reruns validation; the agent never applies
   directly.

Limits: an attempt cap, a token and cost budget, and escalation to a human. The
agent cannot widen its own credentials, edit policy, weaken or remove tests,
merge, or deploy to protected environments. `apply` of agent-authored
infrastructure is automatic only for non-destructive plans in a disposable
environment; destructive plans always need approval. Diagnoses cite evidence
and state uncertainty, distinguishing infrastructure, deployment, application,
and flaky failures.

Optional hosted private SRE inference (GPU-backed) could replace an external
model here. It requires a defined privacy boundary (inference, evidence, storage,
embeddings, telemetry, backups, operator access), isolation, retention and
training-use policy, and no silent fallback to an external provider.

## 10. Environment lifecycle, warm capacity, and billing

Vallo composes working environments above the provider primitives, manages
leases and capacity, and surfaces progress, readiness, errors, and resource
identities.

| Layer | Prepared ahead | Remaining at allocation |
| --- | --- | --- |
| Images | OS, tools, skills, common dependencies | Create and boot |
| Compute | Clean booted machines in common sizes | Assign isolation, identity, data, access |
| Data | Seed snapshots, prepared clones | Create private clones, attach, mount |
| Kubernetes | Prepared images or ready clusters | Configure access/storage, verify readiness |
| Application stack | Databases and supporting services | Validate health, connect workflow |

Lifecycle: prepare, validate, advertise, atomically claim, configure, verify,
lease, release, destroy/rebuild. Failed preparation quarantines capacity.
Start with a few common profiles and demand-based replenishment. Unassigned
generic capacity and tenant environments with data have separate isolation and
lifecycle; used tenant machines are destroyed and rebuilt, not cleaned in
place. Never reclaim an assigned environment as warm inventory.

Seeds, warm capacity, and preloaded skills are separate benefits. Copy-on-write
must be verified across nodes and placement; Ceph is a candidate, not a
selected backend. Fifty clones still contend for I/O.

Controls: per-project quota of active environments, auto-destroy on branch
delete/PR close, idle sleep or destroy, hard TTL enforced by the platform (not
a timer inside the guest) covering child workers, Kubernetes resources,
volumes, networks, and tunnels. Workflow budgets cover compute and model usage;
stop admitting work at the boundary and define whether in-flight jobs finish,
checkpoint, or terminate. Externally billed model usage cannot be hard-capped
without customer integration. Metering has durable start/stop events; compute is
billed hourly for persistent environments, and short-job granularity is open.

Coordinators may be Vallo-hosted or customer-hosted. Disposable workers run
bounded jobs; stateful services survive jobs under their own leases. Execution
profiles declare capabilities (Linux/container, Kubernetes, VM, browser).
Windows, Android emulation, and macOS are candidates needing separate demand,
licensing, and isolation validation.

## 11. Customer-reported provider requirements

Source: Nirvana Agent Sandbox integration feedback from 2026-11-04. These are
customer-reported observations, not verified defects and not promises that any
provider meets them.

| Priority | Requirement | Outcome |
| --- | --- | --- |
| P0 | Working snapshots and restores | Prepare a stack once, launch private environments quickly, including on another node |
| P0 | Customer-specific outbound traffic | Stable, allowlistable egress identity with enforced routing |
| P0 | Running-sandbox lifecycle contract | No surprise pause, restart, or relocation; otherwise explicit interruption and recovery behavior |
| P1 | Browser-accessible ingress | Usable hostname or path without a custom routing header (tunnels address this) |
| P1 | Authenticated port access | Authorization on both API proxy and gateway; sandbox IDs are not secrets |
| P1, P0 with continuity | Full filesystem recovery | Preserve installed software and the writable root, not only volumes |
| P1, P0 with continuity | Process-memory recovery | Preserve sessions where supported or signal loss explicitly |

- **Snapshots.** A snapshot request returned 202/Creating, then Failed about two
  seconds later (`snapshot_runtime_create_failed`, Kubernetes 404 creating
  SandboxSnapshot). Acceptance: reaches Ready, the ID creates a sandbox, failures
  are observable, retention is defined, cross-node restore is measured.
- **Egress.** The customer's workaround uses shadowsocks-rust REDIRECT mode,
  iptables NAT, and a static-IP gateway. They asked for CAP_NET_ADMIN, a working
  networkPolicy, or a platform-managed egress IP. NET_ADMIN was absent and
  networkPolicy creation failed (egress.image not configured). The requirement is
  controlled, allowlistable egress, not privilege. For trials: filtered,
  rate-limited outbound rather than a blanket block.
- **Continuity.** Pause/resume preserved the PVC but lost processes and the
  writable filesystem; a reconnect could look successful while the agent had
  forgotten its conversation. Volume, full filesystem, application restart, and
  process-memory recovery are separate contracts. Hard anti-affinity does not
  preserve a failed host's processes.
- **Ingress and authorization.** The tested gateway needed a custom header that
  iframe navigation cannot send. Content was also returned on the API proxy
  without valid credentials. Validate authorization urgently before exposing any
  customer environment; browser-friendly routing must not bypass authentication.

## 12. Free trial deployments

Proposed: an email-only, time-limited environment (around one hour) to show an
agent deploying and configuring software. Guardrails: rate-limited creation,
bounded concurrency, CPU/RAM/storage/model budgets, isolation from customers and
the management network, filtered rate-limited egress, platform-enforced expiry
with retryable cleanup and orphan detection, and a visible expiry clock. Open:
email verification, repeat-trial policy, clock start, exact limits, model
access, preview visibility, shutdown versus deletion timing, retention, export,
and upgrade without losing work. Not assumed: free long-term storage, permanent
deletion at expiry, automatic billing conversion, or the private SRE service.

## 13. Build plan

Suggested sequence, not an approved schedule:

1. **Spike (local).** Gateway plus Docker adapter, a trivial blueprint, a quick
   tunnel, and Check Run reporting: push -> environment -> URL -> teardown.
2. **Controller foundations.** Durable run/job state, queueing, quotas,
   cancellation, idempotent reconciliation, evidence storage, reliable teardown.
   Prove burst submission (for example 15 jobs) without an LLM.
3. **Terraform runner.** Remote locked state, pinned modules, plan review rules.
4. **Nirvana adapter.** After capturing its API and capabilities; handle the
   snapshot and egress gaps as explicit capabilities.
5. **Named tunnels and Access.** DNS, per-environment tokens, cleanup reconciler.
6. **Multi-repository blueprints and release records.** Replay and rollback
   preflight.
7. **Repair loop.** Diagnosis, then opt-in branch fixes with limits.
8. **Warm pools and metering** only after measuring readiness bottlenecks.

## 14. Validation scenarios

Draft acceptance scenarios, not completed tests:

- A push creates a branch environment, deploys, passes readiness, runs tests,
  and posts a Check Run with a working preview URL; closing the PR removes the
  environment, tunnel, DNS record, and volumes with no orphans.
- A second push to the same branch updates the environment without leaking the
  old one; a rapid third push cancels the in-flight run.
- Duplicate webhook delivery and controller restart create no extra resources.
- A unit/e2e failure produces structured evidence; a transient provider error
  retries without invoking the agent; a deployment bug triggers the repair loop,
  which stays within attempt, cost, and permission limits.
- Branch code cannot read controller credentials or reach other environments.
- A retained release replays through preflight; missing artifacts fail
  explicitly rather than resolving newer versions.
- Budget exhaustion, cancellation, and lease expiry yield explicit outcomes,
  keep permitted evidence, and reconcile cleanup.

## 15. Unresolved decisions

- Terraform versus OpenTofu, Ansible's role, state storage and locking.
- Blueprint schema and ownership; Kubernetes/VM topology and tenancy.
- Nirvana API contract and capabilities; OpenStack and AWS priority.
- Storage backend and cross-node clone behavior.
- Credentials and agent approval boundaries; GitHub App permissions; fork PR
  policy; repair-loop limits.
- Safe-secret vault: storage, UI, rotation, per-branch scoping, and whether to
  integrate GitHub secrets. Outcome schema: supported check types and how
  `manual` outcomes are confirmed. Discovery sandbox egress filtering and the
  stub/mock strategy for external services during discovery.
- Preview visibility defaults; Cloudflare account, zone, and Access policy.
- Retention and recovery guarantees; warm-pool sizes; billing rules and
  short-job metering.
- Hybrid and customer-hosted execution connectivity; checkpoint formats;
  evidence schemas; retry and idempotency semantics.
- Private SRE isolation, models, capacity, pricing limits, and service objectives.
- Free-trial eligibility, lease, network, capacity, and retention policies.
