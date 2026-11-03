# Vallo

An original, responsive Vue 3 and Tailwind CSS 4 website concept for **vallo.io**.
Complete, modular environments for development, research, and AI workflows:
whole-environment seeds, independent agent machines, preloaded tools and skills,
optional Kubernetes, private copy-on-write data, shared files, and object
storage. Modern blue design, with compute billed hourly.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The server binds to loopback by default.

```sh
npm test
npm run build
npm run preview
```

The production build is emitted to `dist/` and can be served by a static host.
No environment variables, credentials, or backend are required by the website.

## What's included

- Responsive landing page with original vector illustrations and a Vallo mark.
- Interactive seed-to-fleet diagram: one immutable 5 TB seed, 1-50 independent
  sandboxes, private changed blocks, and an automatically shared project folder.
- Agent inspector with private files, Kubernetes, and shared-result views.
- Optional Kubernetes module, initially off. Enabling it illustrates a full
  application/API/database/queue stack and kubectl preconfigured on every agent
  machine in the environment. Agent tooling and environment-specific skills
  are presented as preloaded regardless of the Kubernetes choice.
- Exact illustrative storage comparison: 250 TB of full starting copies versus
  a 5 TB seed plus fifty 10 GB private changes (5.5 TB of logical backing data).
- Four illustrative machine sizes and a reactive hourly compute calculator.
- Keyboard-accessible navigation, native FAQ disclosures, reduced-motion support.
- Local fonts and assets, with no analytics, remote font requests, or signup collection.
- Component tests covering seed immutability, private-write isolation, shared
  visibility, reset semantics, fleet bounds, storage arithmetic, calculator
  sizes and bounds, navigation, focus management, and required product content.

## Demo boundary

**This is a website, not a cloud platform implementation.** Demo controls
only update browser state. Resource state, capacities, and hourly rates are
explicitly illustrative. No CLI or API is implemented, no infrastructure is
created, no payment is taken, and no information is submitted. Storage pricing,
retention, cluster topology, and production billing terms remain undefined.
The website is deployed at [https://vallo.io](https://vallo.io); this does not
imply availability of an operational sandbox service.

Unchanged blocks remain seed-backed; private writes do not alter the seed or
another agent. Shared results are intentionally visible across the project and
survive private resets. The storage arithmetic excludes shared/object data,
replication, metadata, compression, and overhead: it is not a physical-usage or
billing promise. Import time, I/O throughput, and startup time are not guaranteed.

All calls to action lead to the working local demo or an existing page section,
not to invented signup or documentation endpoints.

See [the website specification](docs/WEBSITE.md) for scope and acceptance criteria.

## Dependency checks

`npm audit --omit=dev` reports no production dependency vulnerabilities at
verification time. The full audit has four moderate findings in transitive
test-formatting dependencies (`js-beautify`, `editorconfig`, `glob`, and
`minimatch`). They are not included in the website bundle. Recheck upstream
updates before adopting this project's tooling for production development.

## Container and deployment

```sh
docker build -t vallo:local .
docker run --rm --read-only --cap-drop=ALL \
  --security-opt=no-new-privileges --tmpfs /tmp:rw,noexec,nosuid,size=32m \
  -p 127.0.0.1:8080:8080 vallo:local
```

The immutable, non-root Nginx container serves port 8080 and `/healthz`.
Only `/tmp` must be writable. HTML is revalidated, hashed assets are cached
immutably, and missing paths return 404. No application runtime configuration
or writable persistent volume is needed.

Source: [visbits/vallo](https://github.com/visbits/vallo).

The publish workflow validates pull requests and publishes successful `main`
builds to `ghcr.io/visbits/vallo:latest`, with a second `sha-<commit>` tag.
Each build runs the component tests and production compilation inside Docker.
Publishing uses GitHub's built-in repository token; no custom registry secret
is required in this repository.

The delivery pipeline is configured to track the image digest in the deployment
repository and reconcile it through Argo CD at [vallo.io](https://vallo.io).
Image tracking and automatic reconciliation are scoped to Vallo; pruning and
self-healing remain disabled. Pause Vallo's image tracker before a manual
rollback so it cannot overwrite a known-good digest pin.
