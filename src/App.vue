<script setup>
import { computed, ref } from 'vue'
import SeedFleet from './SeedFleet.vue'
import BlueprintDemo from './BlueprintDemo.vue'
import {
  ArrowDown, ArrowRight, Box, Check, ChevronDown, Clock3,
  Code2, Cpu, Database, FolderOpen, GitBranch, HardDrive, Layers3,
  Menu, Network, ShipWheel, X, Zap,
} from '@lucide/vue'

const menuOpen = ref(false)
const selectedSize = ref('m')
const hours = ref(8)
const sizes = [
  { id: 's', name: 'Small', cpu: 2, ram: 4, rate: 0.04, use: 'Scripts & lightweight agents' },
  { id: 'm', name: 'Medium', cpu: 4, ram: 8, rate: 0.08, use: 'Your everyday build environment' },
  { id: 'l', name: 'Large', cpu: 8, ram: 16, rate: 0.16, use: 'Parallel agents & bigger builds' },
  { id: 'xl', name: 'X-Large', cpu: 16, ram: 32, rate: 0.32, use: 'Full-stack, full speed' },
]
const selected = computed(() => sizes.find((size) => size.id === selectedSize.value))
const estimate = computed(() => (selected.value.rate * Number(hours.value)).toFixed(2))
const faqs = [
  { question: 'Do I need to use Vallo’s agent?', answer: 'The proposed controller has two entry points: bring repositories for agent-assisted blueprint creation, or invoke a saved blueprint or execution profile from your existing agent or CI. Both use the same execution lifecycle and evidence model. These integrations are illustrated here, not connected to live services.' },
  { question: 'What makes a blueprint replayable?', answer: 'A release record stored in object storage pins repository commits, image digests, deployment definitions, and seed versions. Replay checks that those artifacts are still available. It recreates a deployment formula, not historical database contents or process memory. Rollback requires separate data and migration compatibility checks.' },
  { question: 'Can an agent diagnose and fix a failed run?', answer: 'The proposed workflow collects test output and runtime evidence before optional agent analysis. Customers can choose reports, diagnosis, or an approved repair branch and PR. A suggested cause is not a proven diagnosis, and permission to open a PR is not permission to merge or deploy. The example on this page is entirely scripted.' },
  { question: 'What goes into a seed?', answer: 'A seed is a frozen, versioned starting environment: a machine image, installed tools, environment-specific skills, private data volumes, and application stack definitions. Prepare it once, then give each agent an independent writable sandbox. Updating a seed means a new version, not changing existing sandboxes underneath them.' },
  { question: 'Does a 5 TB seed need 250 TB for 50 agents?', answer: 'Not fifty complete copies of the starting dataset. Copy-on-write clones share unchanged seed blocks and keep private changed blocks separately. A 5 TB seed plus 10 GB of private changes in each of 50 sandboxes illustrates 5.5 TB of logical backing data. Actual physical usage and billing depend on other factors, including replication and metadata. Shared files and object storage are separate.' },
  { question: 'Can one agent change another agent’s files?', answer: 'Not through its private cloned disk. Each sandbox has its own writable layer, so private changes do not alter the seed or other sandboxes. The automatically mounted shared project folder is different: files written there are visible to other agents in the project. This is not one ordinary writable block device attached to fifty machines.' },
  { question: 'What happens when I reset a sandbox?', answer: 'In this demo, resetting private files returns that agent to its seed-backed starting point. It does not undo changes to the shared project folder or other agents. The separately labeled “Reset demo” control clears all simulated private changes and shared results. Production retention and deletion policies are not defined by this illustration.' },
  { question: 'Is Kubernetes included in every environment?', answer: 'Kubernetes is optional: enable it for the sandbox environment when your workflow needs a full stack. With it enabled, kubectl is preconfigured on every agent machine. Rapidly deploy databases, queues, APIs, and supporting services to test your application against real dependencies, not just mocks. A seed carries stack definitions and data, not copied live control-plane credentials. Cluster topology and storage integrations will be defined before launch.' },
  { question: 'How do agents know how to use the environment?', answer: 'The product is designed around preloaded agent tooling and environment-specific skills: guidance for using the environment, building applications, deploying components, and running tests. Keep your team’s tools and repeatable workflows in the seed so agents start with context instead of reconstructing setup. This is provider-neutral; no particular agent integration or autonomous success rate is promised.' },
  { question: 'Is this just for coding agents?', answer: 'No. Vallo is a complete, modular environment for development, research, and AI workflows. Teams can test application stacks, run data experiments, evaluate agent workflows, and explore different approaches from the same trusted starting point. Choose the compute and optional Kubernetes capability your work needs, keep experiments private, and share results across the project.' },
  { question: 'Does copy-on-write mean everything is instant?', answer: 'It avoids copying the entire starting dataset for each clone. Initial data import still takes time, reads still depend on storage performance, and deploying an application stack has its own startup work. This website does not promise a measured clone latency or unlimited I/O.' },
  { question: 'How does hourly billing work?', answer: 'Compute is priced by machine size and billed hourly. The calculator on this page uses example rates only, not a published price list. Billing increments, storage charges, and retention policies will be confirmed before launch.' },
  { question: 'Can I launch a real sandbox from this website?', answer: 'Not yet. This is an interactive product concept, not a provisioning console. All seeds, changed blocks, shared files, and Kubernetes workloads shown here are simulated in your browser. No infrastructure is created, no information is submitted, and no charges are incurred.' },
]

function jumpToDemo() {
  menuOpen.value = false
  document.getElementById('controller-demo')?.scrollIntoView({ block: 'center' })
  document.getElementById('blueprint-entry')?.focus({ preventScroll: true })
}

function jumpToSeed() {
  menuOpen.value = false
  document.getElementById('sandbox-demo')?.scrollIntoView({ block: 'center' })
  document.getElementById('fleet-size')?.focus({ preventScroll: true })
}
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header">
    <div class="page-width flex h-21 items-center justify-between gap-6">
      <a href="#" class="brand" aria-label="Vallo home">
        <svg viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>
        vallo<span class="brand-period">.</span>
      </a>
      <nav aria-label="Main navigation" class="hidden items-center gap-8 md:flex">
        <a href="#platform">Platform</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a>
      </nav>
      <div class="hidden items-center gap-6 md:flex">
        <a class="small-link" href="#faq">Questions?</a>
        <button class="button button-dark button-small" @click="jumpToDemo">Explore the demo <ArrowRight :size="15" /></button>
      </div>
      <button class="mobile-toggle md:hidden" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">
        <X v-if="menuOpen" :size="23" /><Menu v-else :size="23" />
      </button>
    </div>
    <nav v-if="menuOpen" id="mobile-nav" aria-label="Mobile navigation" class="mobile-nav md:hidden">
      <a v-for="link in [['Platform', 'platform'], ['How it works', 'how-it-works'], ['Pricing', 'pricing'], ['Questions?', 'faq']]" :key="link[1]" :href="`#${link[1]}`" @click="menuOpen = false">{{ link[0] }}</a>
      <button class="button button-blue" @click="jumpToDemo">Explore the demo <ArrowRight :size="16" /></button>
    </nav>
  </header>

  <main id="main">
    <div class="concept-notice">PRODUCT DIRECTION PREVIEW <span>Explore the proposed controller. All workflows and results below are simulated.</span></div>
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="page-width hero-grid">
        <div class="hero-copy">
          <div class="eyebrow-pill"><span class="blue-dot"></span> YOUR STACK. A REPEATABLE FORMULA. <ArrowRight :size="13" /></div>
          <h1>From repos<br />to running.<br /><span class="build-word">Repeatably<svg viewBox="0 0 280 18" aria-hidden="true"><path d="M3 12C71 1 198 1 273 10M25 16c89-7 158-7 224-3" /></svg></span><span class="text-blue-600">.</span></h1>
          <p class="hero-description">Turn your code, dependencies, and deployment knowledge into a blueprint. Let an agent compose the infrastructure—or bring your own agent. Deploy the whole stack, test it, and keep the formula for next time.</p>
          <div class="hero-actions flex flex-wrap gap-3">
            <button class="button button-blue" @click="jumpToDemo">Explore the controller <GitBranch :size="17" /></button>
            <a href="#how-it-works" class="button button-white">Follow a branch push <ArrowDown :size="16" /></a>
          </div>
          <div class="hero-checks"><span><Check :size="14" /> Your tools &amp; data</span><span><Check :size="14" /> Independent clones</span><span><Check :size="14" /> Billed by the hour</span></div>
          <div class="hero-promise"><span>20 REPOS</span><GitBranch :size="19" /><span>ONE BLUEPRINT</span><p>Agents compose. The controller executes.<br /><strong>Every run leaves evidence.</strong></p></div>
        </div>

        <BlueprintDemo id="controller-demo" />
      </div>
      <div class="page-width capability-strip">
        <span>THE WHOLE STACK.<br /><strong>ONE PLACE TO BUILD.</strong></span>
        <div><GitBranch />Reusable seeds</div><div><Cpu />Virtual machines</div><div><ShipWheel />Optional Kubernetes</div><div><FolderOpen />Shared files</div><div><Database />Object storage</div>
      </div>
    </section>

    <section id="platform" class="section page-width">
      <div class="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p class="eyebrow">COMPOSABLE INFRASTRUCTURE, NOT ANOTHER SETUP SCRIPT.</p><h2>The whole environment.<br />Not just somewhere to run code.</h2></div>
        <p class="section-intro">Complete, modular environments for development, research, and AI workflows. Reusable components. Optional Kubernetes. VM workers when you need them.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card compute-card">
          <div class="icon-box"><GitBranch :size="23" /></div><h3>Your world.<br />Saved as a seed.</h3>
          <p>Bring your machine image, tools, private data, and stack definitions. Preload agent tooling and environment-specific skills so agents know how to use the environment. Save a seed. Start independent experiments.</p>
          <div class="cpu-visual" aria-hidden="true"><div class="cpu-orbit"></div><div class="cpu-chip"><span>vallo</span><GitBranch :size="36" /><small>SEED V1</small></div><span class="chip-label label-top">TOOLS + STACK</span><span class="chip-label label-bottom">YOUR DATA, ALREADY THERE</span></div>
          <div class="feature-foot"><Zap :size="14" /> Tools and skills ready. Setup not repeated.</div>
        </article>
        <article class="feature-card kubernetes-card">
          <div class="flex items-center justify-between"><div class="icon-box"><ShipWheel :size="24" /></div><span class="included-badge">OPTIONAL. FULL-STACK.</span></div>
          <h3>Not just your app.<br />Everything it runs with.</h3>
          <p>Enable Kubernetes and rapidly deploy databases, queues, and supporting services alongside your app. kubectl is preconfigured on every agent machine, so teams and agents can build, deploy, and test a real stack.</p>
          <div class="cluster-diagram" aria-label="Optional Kubernetes environment connecting application, database, and queue workloads">
            <div class="cluster-root"><ShipWheel :size="20" /> Your Kubernetes environment <span class="status-dot"></span></div>
            <div class="connection-lines" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="cluster-nodes"><div><Code2 :size="23" /><strong>app</strong><span>deployment</span></div><div><Database :size="23" /><strong>database</strong><span>stateful workload</span></div><div><Network :size="23" /><strong>queue</strong><span>supporting service</span></div></div>
          </div>
          <div class="feature-foot"><Check :size="14" /> Enable the stack. kubectl is ready.</div>
        </article>
        <article class="feature-card storage-card">
          <div class="icon-box"><Layers3 :size="23" /></div><h3>Private experiments.<br />Shared breakthroughs.</h3>
          <p>Private cloned disks keep experiments independent. An automatically mounted project folder brings agents together. Object storage gives artifacts a home.</p>
          <div class="storage-visual"><div><div class="storage-mini-icon"><HardDrive :size="21" /></div><span><strong>Block storage</strong><small>Independent copy-on-write layers</small></span><Check :size="16" /></div><div><div class="storage-mini-icon"><FolderOpen :size="21" /></div><span><strong>Shared files</strong><small>Same live folder, every sandbox</small></span><Check :size="16" /></div><div><div class="storage-mini-icon"><Database :size="21" /></div><span><strong>Object storage</strong><small>Datasets, artifacts, and outputs</small></span><Check :size="16" /></div></div>
          <div class="feature-foot"><Box :size="14" /> Different storage. Different jobs.</div>
        </article>
      </div>
    </section>

    <section id="how-it-works" class="workflow-section">
      <div class="page-width section">
        <div class="section-heading text-center"><p class="eyebrow">PUSH → DEPLOY → TEST → UNDERSTAND</p><h2>A branch push.<br />The whole stack, put to the test.</h2><p class="mt-4 text-slate-500">One proposed workflow. From a code change to a result your team can act on.</p></div>
        <div class="steps-grid">
          <article><span class="step-number">01 <span></span></span><GitBranch class="step-icon" /><h3>Resolve the formula.</h3><p>Pin the changed commit and every dependency to a saved integration baseline. Reuse your Helm charts, Terraform, and build scripts instead of starting over.</p></article>
          <article><span class="step-number">02 <span></span></span><ShipWheel class="step-icon" /><h3>Deploy. Then prove it.</h3><p>Compose your app, database, queue, and test workers. Wait for readiness, run integration checks, and collect evidence—not just a green deployment status.</p></article>
          <article><span class="step-number">03 <span></span></span><Code2 class="step-icon" /><h3>Understand what changed.</h3><p>Return results to GitHub or Slack. Optionally ask an agent to explain the failure and propose a repair PR. Your policy decides what happens next.</p></article>
        </div>
        <p class="workflow-caveat">Planned integrations, illustrated in your browser. No repositories are accessed, messages sent, or pull requests created.</p>
      </div>
    </section>

    <section class="section page-width controller-principles" aria-label="Controller design principles">
      <article><span class="eyebrow">REPLAYABLE BY DESIGN</span><h3>Keep the recipe.<br />Not just the result.</h3><p>Object-stored release records capture exact commits, image digests, and seed versions. Select a past formula, check its dependencies, and reproduce the environment.</p><small>Software replay is not database rollback.</small></article>
      <article><span class="eyebrow">YOUR AGENT, YOUR BOUNDARY</span><h3>Keep the coordinator.<br />Borrow the workers.</h3><p>Keep decisions and sensitive state on your infrastructure. Dispatch bounded jobs to isolated workers, with queues, budgets, evidence, and explicit cleanup.</p><small>Persistent coordination. Disposable execution.</small></article>
      <article><span class="eyebrow">PRIVATE SRE · FUTURE DIRECTION</span><h3>More understanding.<br />Less data movement.</h3><p>A proposed private, GPU-hosted diagnostic service with fixed-price plans. Analyze evidence inside a defined privacy boundary, even if large investigations take longer.</p><small>Privacy terms, capacity, and pricing are not yet defined.</small></article>
    </section>

    <section class="seed-section">
      <div class="page-width section seed-showcase">
        <div class="section-heading"><p class="eyebrow">THE DATA BEHIND THE BLUEPRINT</p><h2>Bring 5 TB.<br />Start 50 experiments.<br />Keep one starting point.</h2><p class="hero-description">Blueprints describe the stack. Seeds carry its starting data and tools. Give every worker a private copy-on-write layer, with shared project files for the results that belong together.</p><p class="workflow-caveat">Illustrative logical storage, not a physical-usage or pricing promise. Imports, I/O, and application startup still take time.</p></div>
        <SeedFleet id="sandbox-demo" :machine="selected" />
      </div>
    </section>

    <section id="pricing" class="section page-width">
      <div class="section-heading"><p class="eyebrow">RIGHT-SIZED COMPUTE</p><div class="flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2>A little experiment.<br />Or your next big thing.</h2><p class="section-intro">Different workloads. Different sizes.<br />Simple hourly compute.</p></div></div>
      <div class="pricing-layout">
        <div>
          <div class="pricing-note"><span class="demo-badge">DESIGN PREVIEW</span> Example sizes and rates. Not a published price list.</div>
          <fieldset class="size-grid"><legend class="sr-only">Choose an example VM size</legend>
            <label v-for="size in sizes" :key="size.id" class="size-card" :class="{ selected: selectedSize === size.id }">
              <input v-model="selectedSize" type="radio" name="machine-size" :value="size.id" />
              <span class="flex items-center justify-between"><span class="size-name">{{ size.name }}</span><span class="radio-indicator"><Check v-if="selectedSize === size.id" :size="12" /></span></span>
              <Cpu :size="23" class="size-cpu" /><strong>{{ size.cpu }} <span>vCPU</span></strong><p>{{ size.ram }} GB RAM</p>
              <div class="size-rate">${{ size.rate.toFixed(2) }}<span> / hr</span></div><small>{{ size.use }}</small>
            </label>
          </fieldset>
          <p class="included-line"><ShipWheel :size="17" /> Add Kubernetes when your workflow needs it. <span>Agent tooling and environment-specific skills preloaded.</span></p>
        </div>
        <aside class="estimate-card" aria-label="Illustrative compute cost calculator">
          <div class="flex items-center gap-2"><Clock3 :size="17" /><h3>A little cost clarity.</h3></div><p>Example compute for one sandbox, not the fleet.</p>
          <div class="hours-label"><label for="hours">Runtime</label><output for="hours">{{ hours }} hours</output></div>
          <input id="hours" v-model.number="hours" type="range" min="1" max="72" step="1" /><div class="range-labels"><span>1 hour</span><span>72 hours</span></div>
          <div class="estimate-total"><span>Example total</span><output aria-live="polite" data-testid="estimate">${{ estimate }}</output></div>
          <p class="estimate-detail">{{ selected.name }} · ${{ selected.rate.toFixed(2) }}/hr × {{ hours }} hr</p>
          <p class="estimate-disclaimer">Illustrative VM compute only. Kubernetes and storage pricing, taxes, and final billing terms are not included.</p>
          <button class="button button-blue w-full" @click="jumpToSeed">Try this size in the seed demo <ArrowRight :size="16" /></button>
        </aside>
      </div>
    </section>

    <section id="faq" class="faq-section page-width section">
      <div><p class="eyebrow">A FEW MORE DETAILS</p><h2>Good questions.<br />Straight answers.</h2><p class="mt-5 max-w-70 text-slate-500">A little more about the environments<br />we're building.</p></div>
      <div class="faq-list"><details v-for="faq in faqs" :key="faq.question"><summary>{{ faq.question }}<ChevronDown :size="18" /></summary><p>{{ faq.answer }}</p></details></div>
    </section>

    <section class="page-width cta-wrapper">
      <div class="final-cta">
        <div class="cta-orbits" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="relative"><p class="eyebrow">ONE FORMULA. EVERY NEXT RUN.</p><h2>Compose it once.<br />Build on it again.</h2><p>Your repositories. Your agent. A repeatable path to a working stack.</p><button class="button button-white" @click="jumpToDemo">Explore the controller concept <ArrowRight :size="17" /></button><span class="cta-note">Interactive demo. No account needed.</span></div>
        <svg class="cta-mark" viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>
      </div>
    </section>
  </main>
  <footer class="page-width footer"><div><a href="#" class="brand"><svg viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>vallo<span class="brand-period">.</span></a><p>Complete environments. Ready for what comes next.</p></div><div class="footer-links"><a href="#platform">Platform</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><div class="footer-meta"><span>vallo.io</span><p>© {{ new Date().getFullYear() }} Vallo. Website concept.</p></div></footer>
</template>
