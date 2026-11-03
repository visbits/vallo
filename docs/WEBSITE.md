# Vallo website

Status: Approved

## Product direction

Vallo gives agents a complete starting environment, independent experiments,
and a common place to collaborate:

- **Seed:** an immutable, versioned machine image, installed tools, private
  data volumes, and application stack definitions.
- **Sandbox:** an independent writable clone of a seed, with a Kubernetes
  environment for deploying and testing the stack.
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
Show Kubernetes inside each sandbox and the shared project folder connecting
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

## Recovery

Pause only Vallo's image updater before pinning a previous known-good digest;
otherwise the tracked tag could overwrite a manual rollback. Do not delete
resources or alter DNS during a website release. No data migration is involved.
