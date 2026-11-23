# Vallo website

Status: Implemented

This document covers the business concept, positioning, and marketing website.
How the product would actually work (architecture, APIs, infrastructure, security)
is in [PROTOTYPE.md](PROTOTYPE.md). Only the website is implemented; the product
described here is a concept.

## Controller concept preview

Status: Implemented

On 2026-11-05 the user requested a website visualization of the unified
controller direction and explicitly selected local preview only: no push or
deployment. This authorizes an isolated, non-authoritative visual prototype,
not implementation of the platform. Docmost remains Not required.

The preview replaces the seed-first hero with a controller diagram: repositories
or an existing agent feed a pinned blueprint, composed infrastructure, and a
resolve/deploy/test/report workflow. Visitors can switch entry points, inspect
an illustrative object-stored release record, advance a scripted run, inspect
a failed-test hypothesis, and replay a passing baseline. No external requests,
repositories, models, infrastructure, notifications, or repair PRs are invoked.
Mock revision/digest values and test results are explicitly illustrative.

Retain the working seed/storage demo and VM-only calculator as supporting
sections. Align workflow copy, FAQs, metadata, and CTAs with the controller
concept. Show the private SRE idea as future direction, not an available service.
Validate interactions, reset/replay behavior, mobile layouts, existing seed
behavior, and production build before handing off the local preview. Do not
mark the future-platform design implemented based on this prototype.

Local verification on 2026-11-05: 18 component tests and the production build
pass. Browser checks cover both entry points, staged execution, failed-result
diagnosis, baseline replay, reset, and keyboard activation. Expanded release
records were checked at 320, 390, 768, 1024, and 1440 pixel widths without
document overflow; the tested interactions produced no application errors.
The initial local preview was delivered without committing or deploying.

On 2026-11-05 the user subsequently requested "push it to prod", approving
publication of this website concept to vallo.io on compute.cin1 through the
existing automatic delivery pipeline. This does not approve implementation of
the future platform. The customer transcript and accumulated future-platform
notes remain local and are excluded from the public source release.

Production verification on 2026-11-05:

- Website release `6d3a981b78c0fa70cb53a99826d6e4170ff7877a` passed all
  18 tests and the production build, including
  [CI run 42057609024](https://github.com/visbits/vallo/actions/runs/42057609024).
- Image Updater automatically recorded the release in GitOps commit `3f3f1c7`.
  Deployed image digest:
  `sha256:9038a944a46a2a430b9f22c45585346ebe8e77736b39e4ebccbbab5d18f20922`.
- Argo `cin1-vallo` is Synced/Healthy, with two Ready replicas and zero
  restarts. No manual image pin or workload sync was needed.
- Public HTTPS, HTML, both immutable assets, health, and missing-asset 404
  checks pass. Public browser checks confirm failed-run diagnosis, baseline
  replay, direct-agent entry, and the retained seed demo without application
  errors. The pre-existing blocked Cloudflare analytics beacon remains.
- Only the website concept is implemented. The product design remains Draft in
  [PROTOTYPE.md](PROTOTYPE.md). These local notes and the interview were not
  published.

## Product concept (business)

Status: Draft

Recorded at the user's request on 2026-11-04 through 2026-11-23. These are
positioning and business notes, not implemented capabilities, published terms,
or approval to build, deploy, or make public promises. The existing public
marketing remains provider-neutral; named integration targets here do not
change that copy. Docmost documentation remains Not required.

### What Vallo is

Vallo is a universal agent controller and orchestrator specializing in
repeatable, composable infrastructure for rapid deployment and testing.
"Universal" means multiple agent clients and execution profiles share one
orchestration model; it does not promise every runtime, cloud, or agent.

In one sentence for customers: **push your code, get a working, tested,
shareable copy of your whole stack for every branch.**

The core loop is: describe or submit, compose, resolve a release, deploy, test,
collect evidence, report, then release or retain.

### Who it is for

- Teams with multi-service software that is hard to run end to end (the
  representative scenario is roughly 20 repositories needed for integration
  testing) and who want every branch verified in a realistic environment.
- Teams running AI agents that need complete, disposable, parallel
  environments for development, research, and testing.
- Customers with their own orchestrator or CI who want burstable execution
  underneath it, without adopting Vallo's planner or switching models.

### Headline experience: an environment for every branch

A customer connects a GitHub repository. On each push Vallo builds the code,
deploys it with its dependencies in an isolated environment, runs the tests,
and reports the result on the commit and pull request. If the application has a
web interface or API, the customer gets a temporary link to open it, secured
and removed automatically when the branch is done. Customers get a fully
functional environment per branch without maintaining their own preview
infrastructure.

### Differentiators

- **Deterministic, not token-hungry.** Routine runs execute through standard
  infrastructure tooling, not an AI re-planning every deployment. Agents are
  used to author blueprints and to diagnose and fix failures, so cost and
  behavior are predictable.
- **Agents program the infrastructure.** An existing customer especially liked
  agentic programming of infrastructure deployment and configuration. This
  is qualitative feedback from one customer, not market validation, but it
  makes agent-authored deployments a central experience.
- **Repeatable and replayable.** Each run is tied to exact code, images, and
  configuration, so a past release can be inspected, replayed, or compared.
- **Complete environments.** Seeds, preloaded tools and skills, optional
  Kubernetes, shared files, and object storage, assembled and torn down as one
  unit.
- **Provider flexibility.** Built first for the customer's existing sandbox
  provider, designed to work with other infrastructure over time.

### Two ways to use it

- **Assisted:** the customer supplies repositories and deployment assets;
  a Vallo-connected agent produces a reviewable blueprint and runs it with the
  customer's authorization.
- **Bring your own orchestration:** the customer's own agent or CI submits jobs
  or invokes a published blueprint through a scoped interface, keeping
  its own planner, model, and secrets.

### Customer evidence and its limits

- The [November 05 customer interview](dan-alaqmar-chat.txt) supports
  burstable execution beneath existing orchestration, persistent core agents with
  ephemeral tool workers, hybrid privacy boundaries, and budget-aware work.
  The customer described roughly 10-15 simultaneous tool jobs per campaign. This
  is a useful pilot scenario, not a measured capacity requirement or proof of
  willingness to pay, and it does not establish demand for hosted private SRE
  inference.
- The November 04 integration feedback from the initial customer identifies
  must-haves around working snapshots and restores, customer-specific outbound
  traffic, predictable sandbox lifecycle, browser-accessible and authenticated
  access, and recovery of filesystem and session state. These are
  customer-reported requirements, not verified defects or promises; the
  technical detail is in [PROTOTYPE.md](PROTOTYPE.md).
- The customers' P0 items must inform what is built first.

### Offerings under consideration

- **Per-branch environments from GitHub** (the headline experience above).
- **Hourly compute** for persistent environments, billed per machine size;
  short-job pricing granularity is unresolved.
- **Free, time-limited trial.** An existing customer suggested a free
  deployment service requiring only an email address, roughly one hour of
  runtime, then automatic shutdown. Duration and eligibility are proposals,
  not published terms. The trial should show real product value: bring
  software or choose a starting point, let an agent configure and deploy it,
  inspect the result, and understand the resulting blueprint. The user accepts
  some abuse risk in exchange for low signup friction. Do not assume free
  long-term storage, permanent deletion at expiry, automatic conversion to
  billing, or inclusion of the private SRE service.
- **Private SRE diagnostics with fixed pricing** (long-term pillar).
  A hosted, GPU-backed model explains failures from customer evidence, with
  privacy and predictable pricing as primary goals. Larger projects may take
  longer; latency is not the overriding requirement. It is not an implemented
  service, selected model, published price, or response-time guarantee.
  Fixed pricing must not be presented as unlimited work, immediate service,
  or fixed provider cost, and no limits or overage model is selected. Privacy
  claims require a defined processing boundary, tenant isolation, retention
  and training-use policy, and no silent fallback to an external model.
- **Connect familiar AI services** (for example ChatGPT or Claude) to Vallo.
  These are requested integration targets, not existing connectors; access
  and billing models are undesigned, and a consumer subscription is not
  assumed to provide API access.

### Claims we can and cannot make

Allowed now: the website concept and its illustrative demos, described as
illustrative.

Not allowed without validation: that environments start in a given time;
that storage is cheap or unlimited; that jobs are never interrupted; that any
specific cloud, OpenStack, AWS, or AI service is supported; that processes or
memory survive interruptions; that private inference is available; that data is
private or retained for any period; that a free tier exists. Avoid presenting
fixed pricing as unlimited. A past release is replayable on a best-effort basis
under a retention policy, not forever.

### Sequencing at the business level

1. Prove the shared execution foundation and per-branch environments with a
   pilot customer.
2. Extend to multi-repository integration runs and reproducible releases.
3. Add assisted authoring, customer-hosted orchestration, diagnosis, and
   opt-in repair pull requests.
4. Evaluate warm capacity, the free trial, and private SRE economics in
   parallel with measured readiness data.

Open business decisions: pricing model and billing granularity; free-trial
eligibility; named provider support; preview-link visibility defaults; private
SRE scope and price limits; retention promises; and which customer P0 comes first.
Recording these ideas does not authorize implementation, security changes,
public marketing promises, or deployment.

## Modular environment positioning update

Status: Implemented

The existing seed-to-fleet release below is implemented. This amendment changes
the marketing and browser demonstration, not the underlying cloud platform.
The user requested this direction on 2026-11-02 and confirmed that Kubernetes is
optional per sandbox environment and that agent tooling remains provider-neutral.
Docmost documentation remains Not required.
The user explicitly approved implementation and publication of this written
scope on 2026-11-02.

- Position Vallo as a complete, modular environment for development, research,
  and AI workflows, rather than only a place to execute an agent.
- Emphasize rapid environment assembly and application deployment, reusable
  seeds, isolated experiments, shared results, and hourly compute billing.
  Preserve the existing startup/I/O caveats and illustrative rates.
- Describe preloaded agent tooling and environment-specific skills that help
  agents use the environment. Do not invent named integrations or guarantees.
- Kubernetes is an optional capability, not included unconditionally. When
  enabled, all agent machines in that environment have kubectl preconfigured.
  Explain the value of deploying databases, queues, and supporting services
  alongside an application for realistic full-stack tests.
- Add a clearly labeled environment-level Kubernetes checkbox to the demo,
  initially off. Agent badges and the Kubernetes inspector reflect that choice.
  The enabled illustration shows application, API, database, and queue workloads
  plus kubectl readiness; the disabled view explains how to opt in.
  Changing this option must not reset private data or shared results, alter the
  example compute estimate, or claim real infrastructure was provisioned.
  Data resets preserve the selected module configuration, like the fleet size.
- Align hero, feature cards, workflow, pricing caveats, FAQ, page metadata,
  README, and tests. Preserve the seed arithmetic and existing interactions.
- Publish the approved website update through the existing automatic delivery
  pipeline and update the workspace submodule pin. No CI, Kubernetes manifests,
  credentials, Cloudflare settings, or other repositories' behavior changes.

Acceptance: tests cover both Kubernetes states, preconfigured kubectl only when
enabled, unchanged data and compute estimates, and required positioning.
Production build and responsive browser checks pass; the automatic release is
healthy and the public site displays the new messaging. Mark this amendment
Implemented only after those checks pass.

Verified 2026-11-03 UTC:

- All 14 component tests and the production build pass, including both module
  states, conditional kubectl readiness, preserved data, and unchanged compute.
- Keyboard controls and responsive layouts pass from 320 to 1440 pixels.
  Public browser checks confirm both Kubernetes states, the four illustrated
  workloads, shared/private data preservation, the new copy, and page metadata.
- Release `284b485` passed
  [the publication workflow](https://github.com/visbits/vallo/actions/runs/41578431588)
  and was automatically deployed without a manual digest update or sync.
  Argo is Synced/Healthy, both replicas are Ready, and public HTTPS/health pass.
- The previously recorded external analytics CSP warning remains unchanged.
  No infrastructure configuration or backend provisioning was added.

## Product direction

Vallo gives agents a complete starting environment, independent experiments,
and a common place to collaborate:

- **Seed:** an immutable, versioned machine image, installed tools, private
  data volumes, and application stack definitions.
- **Sandbox:** an independent writable clone of a seed with preloaded agent
  tooling and environment-specific skills. Kubernetes is optional; when
  enabled, kubectl is preconfigured on every agent machine in the environment.
- **Shared project folder:** a live filesystem automatically available to
  every sandbox in a project, outside the frozen seed and private write layers.
- **Object storage:** a separate facility for datasets, artifacts, and outputs.
- Virtual machines come in multiple sizes and compute is billed hourly.

The user approved this direction and the complete website/repository/automatic
deployment scope on 2026-11-02. The original blue Vue/Tailwind landing page and
its static container were implemented earlier that day. Architecture
documentation in Docmost was explicitly marked Not required.

## Website scope

Replace the generic terminal hero with a seed-to-fleet illustration showing
one frozen 5 TB environment branching into 1-50 private writable sandboxes.
Show the selected Kubernetes capability and the shared project folder connecting
the entire fleet. The original Vallo visual identity remains blue and modern.

Visitors can:

1. Adjust the fleet size and inspect an agent.
2. Simulate private changed blocks in one agent or across the fleet.
3. Share a result and see it from other agents.
4. Inspect the selected sandbox's illustrative Kubernetes stack.
5. Reset an agent's private changes without deleting shared results, or use a
   separately labeled reset to clear the entire demo.

Explain the same concepts consistently in feature cards, workflow, FAQ,
calls to action, and pricing notes. Retain the machine-size selector and
hourly compute calculator, explicitly per sandbox.

## Storage and simulation boundaries

- Unchanged blocks remain seed-backed. A private write changes neither the
  seed nor another sandbox. This is not one ordinary writable disk attached
  to many machines.
- Seed versions describe reproducible environments, not copies of live cluster
  credentials or control-plane identities. Shared project data stays live.
- Use decimal units: 1 TB = 1,000 GB. Fifty full 5 TB starting copies represent
  250 TB; a seed plus fifty 10 GB private changes represents an illustrative
  5.5 TB of logical backing data.
- Label all arithmetic illustrative. Exclude shared/object data, replication,
  metadata, compression, and other overhead; do not promise physical usage or
  storage charges. Fast clone creation does not mean instant initial uploads,
  unlimited I/O, or a guaranteed startup duration.
- All resource state and actions are simulated in the browser. No provisioning
  API, filesystem, signup collection, authentication, or billing is implemented.

## Source and delivery

The authoritative source is `https://github.com/visbits/vallo`.
Publish website source only, not the history of its former containing workspace.
The containing workspace registers this repository as a submodule at its
existing `Vallo/` path; other projects remain unchanged.

GitHub Actions validates pull requests without publishing images. Successful
main-branch builds publish `ghcr.io/visbits/vallo:latest` and a commit-addressed
tag using the repository's built-in token. The existing deployment controller
tracks that tag by digest, records updates in the deployment repository, and
automatically reconciles only Vallo.

Preserve the existing non-root, read-only Nginx container contract, port 8080,
health endpoint, strict same-origin CSP, two web replicas, domain, tunnel,
and disabled pruning/self-healing. Do not add controller privileges, change
credentials, or affect other applications. Internal rollout evidence and
operational identifiers belong in the deployment repository.

## Acceptance criteria

- Tests verify seed immutability, isolated private changes, automatic shared
  result visibility, private versus full reset, fleet limits, and exact
  storage arithmetic at 1 and 50 sandboxes.
- Existing compute-calculator, navigation, and accessibility behavior remains
  covered. Keyboard controls and reduced motion remain supported.
- Production build and container checks pass, including the strict CSP.
- Desktop/mobile browser checks show no document overflow.
- Verify the actual release path: source push, successful CI, image publication,
  automatic digest write-back, healthy rollout, and public HTTPS content.
- Mark this specification Implemented only after these criteria pass.

## Seed-to-fleet release verification

Verified on 2026-11-03 UTC:

- All 12 component tests and the production build pass.
- The rootless, read-only production container passes health, HTML, asset-cache,
  missing-asset 404, and strict-CSP checks. Its interactive demo works without
  application JavaScript or CSP errors.
- Keyboard interactions and layouts were checked at widths 320, 390, 768,
  1024, and 1440 pixels, including expanded agent views, without page overflow.
- Release `b23ee7d` passed
  [the publication workflow](https://github.com/visbits/vallo/actions/runs/41576629243).
  Its image was automatically recorded by the image tracker and deployed by
  Argo, without manually pinning the release digest.
- Public HTTPS confirms the redesigned content, 5.5 TB example, shared-result
  visibility, private reset isolation, Kubernetes view, and full-demo reset.
  The deployment has two ready replicas and is Synced/Healthy.
- The public edge injects an external analytics beacon that the unchanged CSP
  blocks. This is not part of the website bundle; no analytics permission was
  added. The external setting remains unchanged and is recorded separately
  from successful application checks.

## Recovery

Pause only Vallo's image updater before pinning a previous known-good digest;
otherwise the tracked tag could overwrite a manual rollback. Do not delete
resources or alter DNS during a website release. No data migration is involved.
