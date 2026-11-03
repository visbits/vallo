<script setup>
import { computed, ref } from 'vue'
import {
  ArrowDown, ArrowRight, Box, Check, ChevronDown, CircleCheck, Clock3,
  Code2, Cpu, Database, HardDrive, Layers3, Menu, Network, Play,
  RotateCcw, Server, ShieldCheck, ShipWheel, Terminal, X, Zap,
} from '@lucide/vue'

const menuOpen = ref(false)
const running = ref(false)
const activeView = ref('Overview')
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
  { question: 'What makes a Vallo sandbox different?', answer: 'The idea is a complete environment, not just a place to run a script. Your agent gets a virtual machine alongside a real Kubernetes environment to deploy and test a stack, with block and object storage available.' },
  { question: 'Can I bring my own agent and tools?', answer: 'Vallo is designed around virtual machines rather than a specific agent harness. Bring the agent, languages, and tools that fit your workflow. The website demo illustrates the experience; supported images and integrations will be defined before launch.' },
  { question: 'Is Kubernetes part of the sandbox?', answer: 'Yes. A Kubernetes environment is part of the proposed sandbox experience, so agents can test deployments against Kubernetes rather than only local mocks. Cluster topology, quotas, and lifecycle details are not finalized.' },
  { question: 'How does hourly billing work?', answer: 'Compute is priced by machine size and billed hourly. The calculator on this page uses example rates only, not a published price list. Billing increments, storage charges, and retention policies will be confirmed before launch.' },
  { question: 'Can I launch a real sandbox from this website?', answer: 'Not yet. This is an interactive website concept. The sandbox console runs entirely in your browser, creates no infrastructure, collects no signup information, and incurs no charges.' },
]

function resetDemo() {
  running.value = false
  activeView.value = 'Overview'
}

function jumpToDemo() {
  menuOpen.value = false
  document.getElementById('sandbox-demo')?.scrollIntoView({ block: 'center' })
  document.getElementById('launch-demo')?.focus({ preventScroll: true })
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
        <button class="button button-dark button-small" @click="jumpToDemo">Explore the sandbox <ArrowRight :size="15" /></button>
      </div>
      <button class="mobile-toggle md:hidden" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">
        <X v-if="menuOpen" :size="23" /><Menu v-else :size="23" />
      </button>
    </div>
    <nav v-if="menuOpen" id="mobile-nav" aria-label="Mobile navigation" class="mobile-nav md:hidden">
      <a v-for="link in [['Platform', 'platform'], ['How it works', 'how-it-works'], ['Pricing', 'pricing'], ['Questions?', 'faq']]" :key="link[1]" :href="`#${link[1]}`" @click="menuOpen = false">{{ link[0] }}</a>
      <button class="button button-blue" @click="jumpToDemo">Explore the sandbox <ArrowRight :size="16" /></button>
    </nav>
  </header>

  <main id="main">
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="page-width hero-grid">
        <div class="hero-copy">
          <div class="eyebrow-pill"><span class="blue-dot"></span> BIG IDEAS NEED REAL INFRASTRUCTURE <ArrowRight :size="13" /></div>
          <h1>Give your agents<br />room to <span class="build-word">build<svg viewBox="0 0 280 18" aria-hidden="true"><path d="M3 12C71 1 198 1 273 10M25 16c89-7 158-7 224-3" /></svg></span><span class="text-blue-600">.</span></h1>
          <p class="hero-description">Instant virtual machines. A real Kubernetes cluster.<br class="hidden lg:block" /> All the storage your stack needs.<br class="hidden lg:block" /> One sandbox. Billed by the hour.</p>
          <div class="hero-actions flex flex-wrap gap-3">
            <button class="button button-blue" @click="jumpToDemo">Try the sandbox demo <ArrowRight :size="17" /></button>
            <a href="#platform" class="button button-white">Meet your infrastructure <ArrowDown :size="16" /></a>
          </div>
          <div class="hero-checks"><span><Check :size="14" /> Bring any agent</span><span><Check :size="14" /> Choose your VM size</span><span><Check :size="14" /> Built for real stacks</span></div>
        </div>

        <div class="console-scene" id="sandbox-demo">
          <div class="console-floating-label"><span class="status-dot"></span> Your next idea starts here</div>
          <div class="sandbox-window">
            <div class="window-top">
              <div class="flex gap-1.5" aria-hidden="true"><i></i><i></i><i></i></div>
              <span>workspace / agent-playground</span><span class="demo-badge">DEMO</span>
            </div>
            <div class="console-heading"><div class="flex items-center gap-2"><Box :size="18" /><strong>My sandbox</strong></div><span class="status-chip" :class="{ 'is-running': running }"><span></span>{{ running ? 'Running' : 'Ready to launch' }}</span></div>
            <div class="console-tabs" aria-label="Sandbox resource views">
              <button v-for="view in ['Overview', 'Kubernetes', 'Storage']" :key="view" :aria-pressed="activeView === view" :class="{ active: activeView === view }" @click="activeView = view">{{ view }}</button>
            </div>
            <div class="console-body">
              <div class="resource-summary">
                <div class="resource-icon"><Cpu v-if="activeView === 'Overview'" :size="21" /><ShipWheel v-else-if="activeView === 'Kubernetes'" :size="23" /><Database v-else :size="21" /></div>
                <div><strong>{{ activeView === 'Overview' ? 'A machine with possibilities.' : activeView === 'Kubernetes' ? 'Not a mock. A real cluster.' : 'A home for your data.' }}</strong><p>{{ activeView === 'Overview' ? `${selected.cpu} vCPU / ${selected.ram} GB RAM / Linux` : activeView === 'Kubernetes' ? 'Deploy your entire stack, not just a container.' : 'Block volumes + object buckets' }}</p></div>
              </div>
              <div class="terminal-panel">
                <div class="terminal-label"><Terminal :size="13" /><span>{{ activeView === 'Overview' ? 'sandbox terminal' : activeView === 'Kubernetes' ? 'cluster terminal' : 'storage explorer' }}</span><span class="ml-auto">ILLUSTRATIVE</span></div>
                <div class="terminal-content" aria-live="polite">
                  <template v-if="activeView === 'Overview'">
                    <p><span class="prompt">~</span> <span class="command">launch</span> agent-playground <span class="flag">--with-kubernetes</span></p>
                    <p class="terminal-muted">A little space for your next big thing.</p>
                    <template v-if="running"><p><span class="terminal-check">✓</span> Virtual machine ready <span class="terminal-muted">{{ selected.cpu }} vCPU</span></p><p><span class="terminal-check">✓</span> Kubernetes environment ready</p><p><span class="terminal-check">✓</span> Block + object storage connected</p><p class="terminal-success">You're in. Let's build something.</p></template>
                    <template v-else><p><span class="terminal-muted">01</span> Pick a machine. Bring an agent.</p><p><span class="terminal-muted">02</span> Deploy a stack. Test the real thing.</p><p><span class="terminal-muted">03</span> Make something that matters.</p><p class="terminal-ready"><span class="prompt">~</span> ready when you are<span class="cursor"></span></p></template>
                  </template>
                  <template v-else-if="activeView === 'Kubernetes'">
                    <p><span class="prompt">~</span> <span class="command">kubectl</span> get pods</p><p class="terminal-muted">NAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; READY &nbsp; STATUS</p>
                    <p>web-app &nbsp;&nbsp;&nbsp;&nbsp; {{ running ? '1/1' : '0/1' }} &nbsp;&nbsp; <span :class="{ 'terminal-success': running }">{{ running ? 'Running' : 'Pending' }}</span></p>
                    <p>api-server &nbsp; {{ running ? '1/1' : '0/1' }} &nbsp;&nbsp; <span :class="{ 'terminal-success': running }">{{ running ? 'Running' : 'Pending' }}</span></p>
                    <p>worker &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{ running ? '1/1' : '0/1' }} &nbsp;&nbsp; <span :class="{ 'terminal-success': running }">{{ running ? 'Running' : 'Pending' }}</span></p>
                    <p class="terminal-muted">{{ running ? 'Demo stack deployed in your sandbox.' : 'Launch the demo to see the stack running.' }}</p>
                  </template>
                  <template v-else>
                    <p><span class="prompt">~</span> sandbox storage</p><p class="terminal-muted">TYPE &nbsp;&nbsp; RESOURCE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; STATE</p>
                    <p>block &nbsp; workspace-data &nbsp;<span :class="{ 'terminal-success': running }">{{ running ? 'Attached' : 'Pending' }}</span></p>
                    <p>object &nbsp;build-artifacts <span :class="{ 'terminal-success': running }">{{ running ? 'Ready' : 'Pending' }}</span></p>
                    <p class="terminal-muted">Volumes for your workloads.</p><p class="terminal-muted">Buckets for everything they create.</p>
                  </template>
                </div>
              </div>
              <div class="console-bottom"><span><ShieldCheck :size="13" /> Browser-only simulation</span><button id="launch-demo" class="launch-button" @click="running ? resetDemo() : running = true"><RotateCcw v-if="running" :size="13" /><Play v-else :size="13" />{{ running ? 'Reset demo' : 'Launch demo' }}</button></div>
            </div>
          </div>
          <div class="cluster-float"><div class="kube-icon"><ShipWheel :size="29" /></div><div><strong>Kubernetes. Included.</strong><p>Your stack deserves a real cluster.</p></div><CircleCheck :size="19" class="text-blue-600" /></div>
          <div class="scene-caption"><span></span> REAL COMPUTE. REAL POSSIBILITIES.</div>
        </div>
      </div>
      <div class="page-width capability-strip">
        <span>THE WHOLE STACK.<br /><strong>ONE PLACE TO BUILD.</strong></span>
        <div><Cpu />Virtual machines</div><span class="strip-plus">+</span><div><ShipWheel />Kubernetes</div><span class="strip-plus">+</span><div><HardDrive />Block storage</div><span class="strip-plus">+</span><div><Database />Object storage</div>
      </div>
    </section>

    <section id="platform" class="section page-width">
      <div class="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p class="eyebrow">LESS SETUP. MORE SHIPPING.</p><h2>Not just a sandbox.<br />Your entire playground.</h2></div>
        <p class="section-intro">Give your agents more than a terminal.<br />Give them the infrastructure to go from<br class="hidden lg:block" /> “what if” to “it works.”</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card compute-card">
          <div class="icon-box"><Cpu :size="23" /></div><h3>Real machines.<br />Ready for anything.</h3>
          <p>From a quick script to a fleet of coding agents. Pick the compute that fits the job, with instantly available VMs in a range of sizes.</p>
          <div class="cpu-visual" aria-hidden="true"><div class="cpu-orbit"></div><div class="cpu-chip"><span>vallo</span><Cpu :size="36" /><small>COMPUTE</small></div><span class="chip-label label-top">YOUR AGENT</span><span class="chip-label label-bottom">YOUR ENVIRONMENT</span></div>
          <div class="feature-foot"><Zap :size="14" /> Less waiting. More building.</div>
        </article>
        <article class="feature-card kubernetes-card">
          <div class="flex items-center justify-between"><div class="icon-box"><ShipWheel :size="24" /></div><span class="included-badge">THE VALLO DIFFERENCE</span></div>
          <h3>Local is good.<br />Real Kubernetes is better.</h3>
          <p>Deploy your services. Connect your databases. Test the whole stack in a real Kubernetes environment, right inside your sandbox.</p>
          <div class="cluster-diagram" aria-label="Sandbox with an included Kubernetes environment connecting web, API, and database workloads">
            <div class="cluster-root"><ShipWheel :size="20" /> Your Kubernetes environment <span class="status-dot"></span></div>
            <div class="connection-lines" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="cluster-nodes"><div><Code2 :size="23" /><strong>web</strong><span>deployment</span></div><div><Network :size="23" /><strong>api</strong><span>service</span></div><div><Database :size="23" /><strong>database</strong><span>stateful workload</span></div></div>
          </div>
          <div class="feature-foot"><Check :size="14" /> Part of the sandbox. Not an afterthought.</div>
        </article>
        <article class="feature-card storage-card">
          <div class="icon-box"><Layers3 :size="23" /></div><h3>A place for every<br />byte of brilliance.</h3>
          <p>Block storage for your workloads. Object storage for datasets, build artifacts, and everything your agents dream up.</p>
          <div class="storage-visual"><div><div class="storage-mini-icon"><HardDrive :size="21" /></div><span><strong>Block storage</strong><small>Made for your workloads</small></span><Check :size="16" /></div><div><div class="storage-mini-icon"><Database :size="21" /></div><span><strong>Object storage</strong><small>Room for your next big idea</small></span><Check :size="16" /></div></div>
          <div class="feature-foot"><Box :size="14" /> Compute meets storage.</div>
        </article>
      </div>
    </section>

    <section id="how-it-works" class="workflow-section">
      <div class="page-width section">
        <div class="section-heading text-center"><p class="eyebrow">FROM IDEA TO ENVIRONMENT</p><h2>Big ambition. Small setup.</h2><p class="mt-4 text-slate-500">The space to experiment. The infrastructure to make it real.</p></div>
        <div class="steps-grid">
          <article><span class="step-number">01 <span></span></span><Server class="step-icon" /><h3>Pick your playground.</h3><p>Choose a virtual machine size that matches your workload. Start small or make room for more.</p></article>
          <article><span class="step-number">02 <span></span></span><Terminal class="step-icon" /><h3>Bring your agent.</h3><p>Your tools. Your code. Your way of working. Give your agent a real environment to get things done.</p></article>
          <article><span class="step-number">03 <span></span></span><ShipWheel class="step-icon" /><h3>Build. Deploy. Repeat.</h3><p>Deploy your stack to Kubernetes, connect your storage, and test beyond the happy path.</p></article>
        </div>
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
          <p class="included-line"><ShipWheel :size="17" /> Kubernetes is part of every sandbox. <span>Block + object storage available.</span></p>
        </div>
        <aside class="estimate-card" aria-label="Illustrative compute cost calculator">
          <div class="flex items-center gap-2"><Clock3 :size="17" /><h3>A little cost clarity.</h3></div><p>Explore an example compute estimate.</p>
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
        <div class="relative"><p class="eyebrow">LESS FRICTION. MORE POSSIBLE.</p><h2>Your agents have ideas.<br />Give them somewhere to go.</h2><p>Real machines. Real Kubernetes. Real room to build.</p><button class="button button-white" @click="jumpToDemo">Explore your sandbox <ArrowRight :size="17" /></button><span class="cta-note">Interactive demo. No account needed.</span></div>
        <svg class="cta-mark" viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>
      </div>
    </section>
  </main>
  <footer class="page-width footer"><div><a href="#" class="brand"><svg viewBox="0 0 40 36" aria-hidden="true"><path d="M2 4h10l13 28H15L2 4Zm25 0h11L24 32l-5-11L27 4Z" fill="currentColor" /></svg>vallo<span class="brand-period">.</span></a><p>A little space. A lot of possibility.</p></div><div class="footer-links"><a href="#platform">Platform</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><div class="footer-meta"><span>vallo.io</span><p>© {{ new Date().getFullYear() }} Vallo. Website concept.</p></div></footer>
</template>
