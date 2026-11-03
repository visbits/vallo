<script setup>
import { computed, ref } from 'vue'
import SeedFleet from './SeedFleet.vue'
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
  { question: 'What goes into a seed?', answer: 'A seed is a frozen, versioned starting environment: a machine image, installed tools, private data volumes, and application stack definitions. Prepare it once, then give each agent an independent writable sandbox. Updating a seed means a new version, not changing existing sandboxes underneath them.' },
  { question: 'Does a 5 TB seed need 250 TB for 50 agents?', answer: 'Not fifty complete copies of the starting dataset. Copy-on-write clones share unchanged seed blocks and keep private changed blocks separately. A 5 TB seed plus 10 GB of private changes in each of 50 sandboxes illustrates 5.5 TB of logical backing data. Actual physical usage and billing depend on other factors, including replication and metadata. Shared files and object storage are separate.' },
  { question: 'Can one agent change another agent’s files?', answer: 'Not through its private cloned disk. Each sandbox has its own writable layer, so private changes do not alter the seed or other sandboxes. The automatically mounted shared project folder is different: files written there are visible to other agents in the project. This is not one ordinary writable block device attached to fifty machines.' },
  { question: 'What happens when I reset a sandbox?', answer: 'In this demo, resetting private files returns that agent to its seed-backed starting point. It does not undo changes to the shared project folder or other agents. The separately labeled “Reset demo” control clears all simulated private changes and shared results. Production retention and deletion policies are not defined by this illustration.' },
  { question: 'Where does Kubernetes fit?', answer: 'Each sandbox includes a Kubernetes environment so agents can deploy and test their stack against the seeded data. A seed carries stack definitions and private data, not copied live control-plane identities or credentials. The shared project folder stays live outside the frozen seed. Cluster topology and storage integrations will be defined before launch.' },
  { question: 'Does copy-on-write mean everything is instant?', answer: 'It avoids copying the entire starting dataset for each clone. Initial data import still takes time, reads still depend on storage performance, and deploying an application stack has its own startup work. This website does not promise a measured clone latency or unlimited I/O.' },
  { question: 'How does hourly billing work?', answer: 'Compute is priced by machine size and billed hourly. The calculator on this page uses example rates only, not a published price list. Billing increments, storage charges, and retention policies will be confirmed before launch.' },
  { question: 'Can I launch a real sandbox from this website?', answer: 'Not yet. This is an interactive product concept, not a provisioning console. All seeds, changed blocks, shared files, and Kubernetes workloads shown here are simulated in your browser. No infrastructure is created, no information is submitted, and no charges are incurred.' },
]

function jumpToDemo() {
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
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="page-width hero-grid">
        <div class="hero-copy">
          <div class="eyebrow-pill"><span class="blue-dot"></span> WHOLE-ENVIRONMENT SEEDS FOR AGENTS <ArrowRight :size="13" /></div>
          <h1>Your entire<br />environment.<br /><span class="build-word">Every agent<svg viewBox="0 0 280 18" aria-hidden="true"><path d="M3 12C71 1 198 1 273 10M25 16c89-7 158-7 224-3" /></svg></span><span class="text-blue-600">.</span></h1>
          <p class="hero-description">Turn your tools, stack, and terabytes of data into a reusable seed. Give every agent an independent sandbox—with real Kubernetes and a shared project folder built in.</p>
          <div class="hero-actions flex flex-wrap gap-3">
            <button class="button button-blue" @click="jumpToDemo">Branch your first seed <GitBranch :size="17" /></button>
            <a href="#platform" class="button button-white">See how it works <ArrowDown :size="16" /></a>
          </div>
          <div class="hero-checks"><span><Check :size="14" /> Your tools &amp; data</span><span><Check :size="14" /> Independent clones</span><span><Check :size="14" /> Billed by the hour</span></div>
          <div class="hero-promise"><span>01 SEED</span><GitBranch :size="19" /><span>50 DIRECTIONS</span><p>Fork the starting point.<br /><strong>Share only what belongs together.</strong></p></div>
        </div>

        <SeedFleet id="sandbox-demo" :machine="selected" />
      </div>
      <div class="page-width capability-strip">
        <span>THE WHOLE STACK.<br /><strong>ONE PLACE TO BUILD.</strong></span>
        <div><GitBranch />Reusable seeds</div><div><Cpu />Virtual machines</div><div><ShipWheel />Kubernetes</div><div><FolderOpen />Shared files</div><div><Database />Object storage</div>
      </div>
    </section>

    <section id="platform" class="section page-width">
      <div class="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p class="eyebrow">SAME STARTING POINT. DIFFERENT POSSIBILITIES.</p><h2>Bring 5 TB. Start 50 experiments.<br />Don't copy it 50 times.</h2></div>
        <p class="section-intro">Prepare once. Branch independently.<br />Build against the real thing.<br />Bring the results back together.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card compute-card">
          <div class="icon-box"><GitBranch :size="23" /></div><h3>Your world.<br />Saved as a seed.</h3>
          <p>Bring your machine image, tools, private data, and stack definitions. Save a versioned seed, then give each agent its own writable clone.</p>
          <div class="cpu-visual" aria-hidden="true"><div class="cpu-orbit"></div><div class="cpu-chip"><span>vallo</span><GitBranch :size="36" /><small>SEED V1</small></div><span class="chip-label label-top">TOOLS + STACK</span><span class="chip-label label-bottom">YOUR DATA, ALREADY THERE</span></div>
          <div class="feature-foot"><Zap :size="14" /> Shared starting blocks. Private changes.</div>
        </article>
        <article class="feature-card kubernetes-card">
          <div class="flex items-center justify-between"><div class="icon-box"><ShipWheel :size="24" /></div><span class="included-badge">THE VALLO DIFFERENCE</span></div>
          <h3>Don't just inspect it.<br />Build against it.</h3>
          <p>Every sandbox includes a Kubernetes environment. Deploy your seeded stack, connect its data, and let your agents test more than the happy path.</p>
          <div class="cluster-diagram" aria-label="Sandbox with an included Kubernetes environment connecting web, API, and database workloads">
            <div class="cluster-root"><ShipWheel :size="20" /> Your Kubernetes environment <span class="status-dot"></span></div>
            <div class="connection-lines" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="cluster-nodes"><div><Code2 :size="23" /><strong>web</strong><span>deployment</span></div><div><Network :size="23" /><strong>api</strong><span>service</span></div><div><Database :size="23" /><strong>database</strong><span>stateful workload</span></div></div>
          </div>
          <div class="feature-foot"><Check :size="14" /> Part of the sandbox. Not an afterthought.</div>
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
        <div class="section-heading text-center"><p class="eyebrow">SEEDS → SANDBOXES → SHARED RESULTS</p><h2>One setup. A fleet of possibilities.</h2><p class="mt-4 text-slate-500">Give every agent the same head start, without making every experiment the same.</p></div>
        <div class="steps-grid">
          <article><span class="step-number">01 <span></span></span><HardDrive class="step-icon" /><h3>Prepare your seed.</h3><p>Import your data, install your tools, and define your stack. Freeze a versioned starting point with everything the agent needs.</p></article>
          <article><span class="step-number">02 <span></span></span><GitBranch class="step-icon" /><h3>Branch into possibilities.</h3><p>Pick a VM size and launch independent clones. Each agent sees the full seed dataset and keeps its changed blocks private.</p></article>
          <article><span class="step-number">03 <span></span></span><FolderOpen class="step-icon" /><h3>Build apart. Share together.</h3><p>Deploy to Kubernetes. Test your ideas. Put results in the shared project folder, already available to every agent.</p></article>
        </div>
        <p class="workflow-caveat">Copy-on-write avoids full starting-data copies. Initial imports, storage I/O, and application startup still take time.</p>
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
          <p class="included-line"><ShipWheel :size="17" /> Kubernetes is part of every sandbox. <span>Private clones + shared files + object storage.</span></p>
        </div>
        <aside class="estimate-card" aria-label="Illustrative compute cost calculator">
          <div class="flex items-center gap-2"><Clock3 :size="17" /><h3>A little cost clarity.</h3></div><p>Example compute for one sandbox, not the fleet.</p>
          <div class="hours-label"><label for="hours">Runtime</label><output for="hours">{{ hours }} hours</output></div>
          <input id="hours" v-model.number="hours" type="range" min="1" max="72" step="1" /><div class="range-labels"><span>1 hour</span><span>72 hours</span></div>
          <div class="estimate-total"><span>Example total</span><output aria-live="polite" data-testid="estimate">${{ estimate }}</output></div>
          <p class="estimate-detail">{{ selected.name }} · ${{ selected.rate.toFixed(2) }}/hr × {{ hours }} hr</p>
          <p class="estimate-disclaimer">Illustrative compute only. Storage, taxes, and final billing terms are not included.</p>
          <button class="button button-blue w-full" @click="jumpToDemo">Try this size in the demo <ArrowRight :size="16" /></button>
        </aside>
      </div>
    </section>

    <section id="faq" class="faq-section page-width section">
      <div><p class="eyebrow">A FEW MORE DETAILS</p><h2>Good questions.<br />Straight answers.</h2><p class="mt-5 max-w-70 text-slate-500">A little more about the playground<br />we're building.</p></div>
      <div class="faq-list"><details v-for="faq in faqs" :key="faq.question"><summary>{{ faq.question }}<ChevronDown :size="18" /></summary><p>{{ faq.answer }}</p></details></div>
    </section>

    <section class="page-width cta-wrapper">
      <div class="final-cta">
        <div class="cta-orbits" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="relative"><p class="eyebrow">ONE SEED. YOUR NEXT BIG THING.</p><h2>The same head start.<br />Fifty different directions.</h2><p>Your environment. Independent sandboxes. Shared possibilities.</p><button class="button button-white" @click="jumpToDemo">Explore the seed-to-fleet demo <ArrowRight :size="17" /></button><span class="cta-note">Interactive demo. No account needed.</span></div>
        <svg class="cta-mark" viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>
      </div>
    </section>
  </main>
  <footer class="page-width footer"><div><a href="#" class="brand"><svg viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>vallo<span class="brand-period">.</span></a><p>A little space. A lot of possibility.</p></div><div class="footer-links"><a href="#platform">Platform</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><div class="footer-meta"><span>vallo.io</span><p>© {{ new Date().getFullYear() }} Vallo. Website concept.</p></div></footer>
</template>
