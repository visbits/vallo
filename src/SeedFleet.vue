<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDown, Check, FileOutput, FolderOpen, GitBranch, HardDrive, LockKeyhole, Play, RotateCcw, ShipWheel, Sparkles } from '@lucide/vue'

defineProps({ machine: { type: Object, required: true } })

const seedGB = 5000
const fleetSize = ref(50)
const selectedAgent = ref(1)
const privateChanges = ref(Array(50).fill(0))
const sharedResults = ref([])
const activeView = ref('Private files')
const inspectorOpen = ref(false)
const kubeEnabled = ref(false)
const announcement = ref('Explore a 5 TB seed and 50 independent sandboxes.')
const totalChanges = computed(() => privateChanges.value.slice(0, fleetSize.value).reduce((sum, value) => sum + value, 0))
const backingTB = computed(() => formatTB(seedGB + totalChanges.value))
const visibleAgents = computed(() => {
  const middle = selectedAgent.value > 1 && selectedAgent.value < fleetSize.value ? selectedAgent.value : Math.min(2, fleetSize.value)
  return [...new Set([1, middle, fleetSize.value])]
})
const agentName = (id) => `Agent ${String(id).padStart(2, '0')}`
const formatTB = (gb) => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(gb / 1000)

// Removing a simulated sandbox discards only its private layer, never project files.
watch(fleetSize, (size, previous) => {
  if (size < previous) privateChanges.value.fill(0, size)
  selectedAgent.value = Math.min(selectedAgent.value, size)
  announcement.value = `${size} ${size === 1 ? 'sandbox' : 'sandboxes'}. Shared project results are preserved.`
})

function changePrivateFiles() {
  privateChanges.value[selectedAgent.value - 1] += 10
  announcement.value = `${agentName(selectedAgent.value)} changed 10 GB privately. The seed and other agents are unchanged.`
}

// Module selection changes the illustration, not the seed or simulated user data.
watch(kubeEnabled, (enabled) => {
  announcement.value = enabled
    ? 'Kubernetes enabled for this environment. kubectl is preconfigured on every agent machine.'
    : 'Kubernetes disabled for this environment. Private files and shared results are unchanged.'
})

function inspectAgent(id) {
  selectedAgent.value = id
  inspectorOpen.value = true
}

function runFleet() {
  for (let index = 0; index < fleetSize.value; index += 1) privateChanges.value[index] += 10
  announcement.value = `Each of ${fleetSize.value} agents changed 10 GB privately. Illustrative backing data: ${backingTB.value} TB.`
}

function shareResult() {
  const id = sharedResults.value.length + 1
  sharedResults.value.push({ id, name: `agent-${String(selectedAgent.value).padStart(2, '0')}-result-${id}.json` })
  announcement.value = `${agentName(selectedAgent.value)} shared a result. It is visible to every sandbox in the project.`
}

function resetPrivateFiles() {
  privateChanges.value[selectedAgent.value - 1] = 0
  announcement.value = `${agentName(selectedAgent.value)} reset to the seed. Shared project results are unchanged.`
}

function resetDemo() {
  privateChanges.value.fill(0)
  sharedResults.value = []
  selectedAgent.value = 1
  activeView.value = 'Private files'
  announcement.value = 'Entire demo reset. All private changes and shared results cleared.'
}
</script>

<template>
  <section class="seed-fleet" aria-label="Interactive seed-to-fleet demo">
    <div class="fleet-topline"><span><GitBranch :size="14" /> PROJECT / RESEARCH LAB</span><span class="demo-badge">INTERACTIVE DEMO</span></div>
    <div class="fleet-diagram">
      <div class="seed-source">
        <div class="seed-source-icon"><HardDrive :size="25" /></div>
        <div class="seed-source-copy"><div><strong>Research Stack</strong><span>SEED · V1</span></div><p>Machine image · tools + skills · private data · stack definitions</p></div>
        <div class="seed-capacity"><strong data-testid="seed-capacity">5 TB</strong><span><LockKeyhole :size="10" /> FROZEN</span></div>
      </div>
      <div class="environment-modules">
        <p><Sparkles :size="14" /><strong>Agent tooling + skills preloaded</strong></p>
        <span>Environment-specific guidance. Less setup for every agent.</span>
        <label for="kube-enabled"><input id="kube-enabled" v-model="kubeEnabled" type="checkbox" aria-describedby="kube-option-description" /> Enable Kubernetes <small>OPTIONAL</small></label>
        <p id="kube-option-description">{{ kubeEnabled ? 'kubectl preconfigured on every agent machine.' : 'Add databases, queues, and services for full-stack tests.' }}</p>
      </div>
      <div class="branch-label"><span></span><GitBranch :size="13" /> Share unchanged blocks. Branch independently.<span></span></div>
      <div class="sandbox-branches" :class="{ single: visibleAgents.length === 1, double: visibleAgents.length === 2 }">
        <button v-for="agent in visibleAgents" :key="agent" class="agent-node" :class="{ selected: selectedAgent === agent, changed: privateChanges[agent - 1] > 0 }" :aria-pressed="selectedAgent === agent" :aria-label="`Inspect ${agentName(agent)}`" @click="inspectAgent(agent)">
          <span class="agent-node-title"><span class="agent-light"></span>{{ agentName(agent) }}<Check v-if="selectedAgent === agent" :size="12" /></span>
          <span class="agent-data"><HardDrive :size="13" /> Full 5 TB dataset</span>
          <span class="agent-private">+{{ privateChanges[agent - 1] }} GB private</span>
          <span class="agent-kube"><ShipWheel :size="13" /> {{ kubeEnabled ? 'Kubernetes' : 'Kube off' }}</span>
        </button>
      </div>
      <p v-if="fleetSize > visibleAgents.length" class="fleet-more">Showing {{ visibleAgents.length }} of {{ fleetSize }} independent sandboxes. Inspect any agent below.</p>
      <div class="shared-bus" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="shared-project" :class="{ populated: sharedResults.length > 0 }">
        <FolderOpen :size="23" />
        <div><strong>Shared project folder</strong><p>Automatically mounted in every sandbox</p></div>
        <span data-testid="shared-count">{{ sharedResults.length }} {{ sharedResults.length === 1 ? 'result' : 'results' }}<small>VISIBLE TO ALL {{ fleetSize }}</small></span>
      </div>
    </div>

    <div class="fleet-controls">
      <div class="fleet-range-label"><label for="fleet-size">How many directions?</label><output for="fleet-size">{{ fleetSize }} {{ fleetSize === 1 ? 'sandbox' : 'sandboxes' }}</output></div>
      <input id="fleet-size" v-model.number="fleetSize" type="range" min="1" max="50" step="1" />
      <div class="fleet-range-extents"><span>1 sandbox</span><span>50 sandboxes</span></div>
      <div class="storage-comparison">
        <div><span>FULL-COPY STARTING DATA</span><strong data-testid="full-copies">{{ formatTB(seedGB * fleetSize) }} <small>TB</small></strong></div>
        <ArrowDown :size="18" class="comparison-arrow" />
        <div class="cow-total"><span>SEED + PRIVATE CHANGES</span><strong data-testid="backing-data">{{ backingTB }} <small>TB</small></strong></div>
      </div>
      <p class="storage-equation"><span>5 TB seed</span> + {{ totalChanges }} GB changed blocks<span class="equation-note">Illustrative logical backing data, not physical usage or a storage bill.</span></p>
      <button class="fleet-run" @click="runFleet"><Play :size="13" /> Run {{ fleetSize === 1 ? 'the agent' : `all ${fleetSize} agents` }} <span>+10 GB private changes each</span></button>
    </div>

    <details class="agent-inspector" :open="inspectorOpen" @toggle="inspectorOpen = $event.target.open">
      <summary>Go inside a sandbox <ArrowDown :size="14" /></summary>
      <div class="inspector-content">
        <div class="inspector-heading"><label for="selected-agent">Inspect</label><select id="selected-agent" v-model.number="selectedAgent"><option v-for="id in fleetSize" :key="id" :value="id">{{ agentName(id) }}</option></select><span class="machine-summary">{{ machine.cpu }} vCPU / {{ machine.ram }} GB RAM</span></div>
        <div class="inspector-tabs" aria-label="Agent resource views"><button v-for="view in ['Private files', 'Kubernetes', 'Shared folder']" :key="view" :aria-pressed="activeView === view" :class="{ active: activeView === view }" @click="activeView = view">{{ view }}</button></div>
        <div v-if="activeView === 'Private files'" class="private-inspector">
          <div class="private-layer"><LockKeyhole :size="15" /><span>Seed-backed data</span><strong>5 TB · unchanged</strong></div>
          <div class="private-layer write-layer"><Sparkles :size="15" /><span>{{ agentName(selectedAgent) }} only</span><strong data-testid="agent-changes">{{ privateChanges[selectedAgent - 1] }} GB changed</strong></div>
          <div class="inspector-actions"><button @click="changePrivateFiles">Change private files <span>+10 GB</span></button><button @click="resetPrivateFiles"><RotateCcw :size="12" /> Reset private files</button></div>
          <p>Other agents keep their own files. A private reset never deletes shared results.</p>
        </div>
        <div v-else-if="activeView === 'Kubernetes'" class="kube-inspector">
          <template v-if="kubeEnabled">
            <div><ShipWheel :size="19" /><span>A full stack for realistic application tests.</span></div>
            <p class="kubectl-ready">kubectl preconfigured on every agent machine.</p>
            <table><caption>Illustrative stack for {{ agentName(selectedAgent) }}</caption><thead><tr><th>Workload</th><th>Ready</th><th>Status</th></tr></thead><tbody><tr v-for="workload in ['web', 'api', 'database', 'queue']" :key="workload"><td>{{ workload }}</td><td>1/1</td><td><span class="workload-ready">Running</span></td></tr></tbody></table>
            <p>Fresh cluster identity, seeded stack definitions. Not a copy of live control-plane credentials.</p>
          </template>
          <template v-else>
            <div><ShipWheel :size="19" /><span>Kubernetes is not enabled.</span></div>
            <p>Select “Enable Kubernetes” above to add the full-stack illustration. Your agent tools, skills, private data, and shared project folder are available either way.</p>
          </template>
        </div>
        <div v-else class="shared-inspector">
          <p>The same project folder, whether you're {{ agentName(selectedAgent) }} or any other agent.</p>
          <ul v-if="sharedResults.length"><li v-for="result in sharedResults" :key="result.id"><FileOutput :size="13" /><span>{{ result.name }}</span><Check :size="12" /></li></ul>
          <div v-else class="shared-empty"><FolderOpen :size="19" /> No shared results yet.</div>
          <button class="share-result" @click="shareResult"><FileOutput :size="13" /> Share a result from {{ agentName(selectedAgent) }}</button>
          <p>Shared writes are visible across the project; private writes are not.</p>
        </div>
      </div>
    </details>
    <div class="fleet-footer"><span>Browser-only simulation</span><button aria-label="Reset entire demo" @click="resetDemo"><RotateCcw :size="12" /> Reset demo</button></div>
    <p class="fleet-footnote">Decimal units: 1 TB = 1,000 GB. Excludes shared/object data, replication, metadata, compression, and other overhead.</p>
    <p class="sr-only" role="status">{{ announcement }}</p>
  </section>
</template>

<style scoped>
.seed-fleet { min-width: 0; background: #fff; border: 1px solid #cfddf3; border-radius: 14px; box-shadow: 0 22px 65px -25px #3864bd55; overflow: clip; text-align: left; }
.fleet-topline { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 13px 18px; background: #f8faff; border-bottom: 1px solid #e5edf8; }
.fleet-topline > span:first-child { display: flex; gap: 7px; align-items: center; font: 8px var(--font-mono); letter-spacing: .7px; color: #6780a7; }
.fleet-diagram { padding: 22px 20px 18px; background: radial-gradient(ellipse at top, #edf4ff, #fff 75%); }
.environment-modules { margin-top: 14px; padding: 12px; border: 1px solid #dce7fa; border-radius: 7px; background: #f7faff; color: #536d92; font-size: 9px; }
.environment-modules > p:first-child { display: flex; align-items: center; gap: 6px; color: #355f9f; }.environment-modules > span { display: block; margin-top: 5px; line-height: 1.6; }
.environment-modules label { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; min-height: 36px; margin-top: 6px; cursor: pointer; font-size: 11px; font-weight: 600; }.environment-modules input { width: 16px; height: 16px; accent-color: #235cf5; }.environment-modules small { font-size: 7px; color: #7088ab; letter-spacing: .5px; }
#kube-option-description { line-height: 1.7; }.kube-inspector .kubectl-ready { color: #168569; font-weight: 600; }
.seed-source { display: flex; gap: 11px; align-items: center; border: 1px solid #9cbdfb; border-radius: 9px; padding: 16px 13px; background: linear-gradient(115deg, #2864f7, #194bd0); color: #fff; box-shadow: 0 5px 14px #235cf524; }
.seed-source-icon { display: grid; place-items: center; width: 39px; height: 43px; background: #ffffff16; border: 1px solid #ffffff30; border-radius: 8px; flex-shrink: 0; }
.seed-source-copy { flex: 1; min-width: 0; }.seed-source-copy > div { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }.seed-source-copy strong { font-size: 13px; font-weight: 650; }.seed-source-copy > div > span { font-size: 7px; letter-spacing: .7px; color: #c9dcff; }.seed-source-copy p { font-size: 8px; line-height: 1.7; color: #d7e5ff; margin-top: 5px; }
.seed-capacity { padding-left: 9px; border-left: 1px solid #ffffff30; flex-shrink: 0; }.seed-capacity > strong { display: block; font-size: 28px; font-weight: 650; letter-spacing: -1px; }.seed-capacity > span { display: flex; align-items: center; gap: 4px; font-size: 6px; letter-spacing: 1px; color: #c5d9ff; }
.branch-label { display: flex; align-items: center; justify-content: center; gap: 6px; color: #6280ad; font-size: 8px; padding-block: 17px; }.branch-label > span { flex: 1; height: 1px; background: #d3e1f8; }.branch-label > svg { flex-shrink: 0; }
.sandbox-branches { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; border-top: 1px solid #bbd0f2; padding-top: 16px; margin-inline: 3px; }.sandbox-branches.single { grid-template-columns: minmax(0, 170px); justify-content: center; border-top: none; }.sandbox-branches.double { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.agent-node { position: relative; display: flex; flex-direction: column; text-align: left; min-width: 0; border: 1px solid #d6e2f5; border-radius: 7px; padding: 12px 9px 9px; background: white; }.agent-node::before { content: ""; position: absolute; top: -17px; left: 50%; height: 16px; border-left: 1px solid #bbd0f2; }.agent-node.selected { border-color: #5e8df3; box-shadow: 0 0 0 1px #5e8df330; }.agent-node:hover { background: #f8fbff; }
.agent-node-title { display: flex; gap: 5px; align-items: center; color: #304f7b; font-size: 10px; font-weight: 650; }.agent-node-title > svg { margin-left: auto; color: #235cf5; }.agent-light { width: 4px; height: 4px; background: #81a0d0; border-radius: 50%; }.agent-node.changed .agent-light { background: #0baf85; }.agent-data { display: flex; gap: 5px; align-items: center; font-size: 8px; color: #6882a6; margin-block: 13px 8px; }
.agent-private { font-size: 8px; color: #7890af; padding: 6px; text-align: center; border: 1px dashed #d3dff0; border-radius: 4px; background: #f7faff; }.agent-node.changed .agent-private { color: #087c66; border-color: #9cdecf; background: #ebfaf5; }.agent-kube { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 9px; color: #6484b6; font-size: 8px; }
.fleet-more { text-align: center; font-size: 7px; color: #6d84a3; margin-top: 9px; }.shared-bus { display: flex; justify-content: space-around; height: 17px; width: 75%; margin: 0 auto 10px; border-bottom: 1px solid #c8ddec; }.shared-bus > span { height: 100%; width: 1px; background: #c8ddec; }
.shared-project { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #cfe4e5; border-radius: 7px; background: #f3faf9; color: #397d79; }.shared-project > svg { flex-shrink: 0; }.shared-project > div { flex: 1; }.shared-project strong { display: block; font-size: 11px; font-weight: 650; }.shared-project p { font-size: 8px; color: #5b8989; margin-top: 4px; }.shared-project > span { text-align: right; font-size: 12px; font-weight: 650; }.shared-project small { display: block; font-size: 5px; margin-top: 5px; letter-spacing: .6px; font-weight: 600; }.shared-project.populated { border-color: #75c7b6; background: #eaf9f3; }
.fleet-controls { padding: 18px 20px; border-top: 1px solid #e6edf8; }.fleet-range-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 10px; color: #536d92; }.fleet-range-label output { color: #235cf5; font-size: 11px; font-weight: 650; }.fleet-range-extents { display: flex; justify-content: space-between; margin-top: 10px; font-size: 8px; color: #7c90ae; }
.storage-comparison { display: grid; grid-template-columns: 1fr 20px 1fr; align-items: center; gap: 15px; margin-top: 20px; }.storage-comparison > div > span { display: block; font-size: 6px; font-weight: 650; letter-spacing: .65px; color: #7286a4; }.storage-comparison strong { display: block; font-size: 33px; line-height: 1.2; margin-top: 4px; font-weight: 650; letter-spacing: -1px; color: #8293ad; }.storage-comparison strong small { font-size: 15px; font-weight: 500; letter-spacing: 0; }.comparison-arrow { transform: rotate(-90deg); color: #9ab0d0; }.storage-comparison .cow-total strong { color: #235cf5; }.storage-comparison .cow-total > span { color: #5274af; }
.storage-equation { font-size: 9px; color: #6481ad; margin-block: 9px 15px; }.storage-equation > span:first-child { font-weight: 650; }.equation-note { display: block; font-size: 7px; color: #7689a6; line-height: 1.6; margin-top: 5px; }
.fleet-run { width: 100%; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 8px; padding: 11px 9px; border-radius: 6px; background: #235cf5; color: #fff; font-size: 10px; font-weight: 600; }.fleet-run:hover { background: #164ce0; }.fleet-run > span { color: #ccdcff; font-size: 8px; font-weight: 400; }
.agent-inspector { border-top: 1px solid #e4ecf8; }.agent-inspector > summary { display: flex; justify-content: space-between; align-items: center; list-style: none; padding: 13px 20px; color: #395f98; background: #f8faff; font-size: 10px; font-weight: 600; }.agent-inspector > summary::-webkit-details-marker { display: none; }.agent-inspector[open] > summary > svg { transform: rotate(180deg); }
.inspector-content { padding: 15px 20px; }.inspector-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 10px; color: #6c83a4; }.inspector-heading select { background: #fff; color: #365782; font-size: 10px; border: 1px solid #cbdaf1; border-radius: 4px; padding: 5px; }.machine-summary { margin-left: auto; font-size: 8px; }
.inspector-tabs { display: flex; gap: 17px; border-bottom: 1px solid #e4ecf8; margin-block: 15px; }.inspector-tabs button { padding: 0 0 9px; border-bottom: 2px solid transparent; font-size: 9px; color: #6e81a1; }.inspector-tabs button.active { color: #235cf5; border-color: #235cf5; }
.private-layer { display: flex; align-items: center; gap: 7px; color: #6984aa; background: #f2f6fe; padding: 10px; border-radius: 5px; font-size: 9px; margin-bottom: 7px; }.private-layer strong { margin-left: auto; font-weight: 550; }.write-layer { color: #2c8975; background: #effaf6; }.inspector-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }.inspector-actions button, .share-result { display: flex; align-items: center; gap: 5px; padding: 8px; border: 1px solid #d4e2fa; border-radius: 5px; color: #3366bb; background: #f4f8ff; font-size: 8px; }.inspector-actions button > span { color: #6987b1; }.private-inspector > p, .kube-inspector > p, .shared-inspector > p { font-size: 8px; line-height: 1.8; color: #6c83a4; margin-top: 10px; }
.kube-inspector > div { display: flex; align-items: center; gap: 8px; font-size: 10px; color: #537ab8; }.kube-inspector table { width: 100%; text-align: left; font: 9px var(--font-mono); border-collapse: collapse; margin-top: 12px; }.kube-inspector caption { text-align: left; font-size: 8px; padding-bottom: 8px; color: #8596ae; }.kube-inspector th { font-weight: 500; color: #8093af; }.kube-inspector th, .kube-inspector td { padding: 7px 4px; border-bottom: 1px solid #ecf1f8; }.workload-ready { color: #168569; }
.shared-inspector > p:first-child { margin-top: 0; }.shared-empty { display: flex; gap: 8px; align-items: center; justify-content: center; font-size: 10px; color: #6c8f98; background: #f3faf8; padding: 18px; border-radius: 6px; margin-block: 12px; }.shared-inspector ul { max-height: 135px; overflow-y: auto; margin-block: 12px; }.shared-inspector li { display: flex; align-items: center; gap: 6px; font: 9px var(--font-mono); color: #417e74; padding: 8px 4px; border-bottom: 1px solid #e3eeeb; }.shared-inspector li > span { overflow-wrap: anywhere; min-width: 0; }.shared-inspector li > svg { flex-shrink: 0; }.shared-inspector li > svg:last-child { margin-left: auto; }.share-result { border-color: #c8e5da; color: #217965; background: #eff9f4; }
.fleet-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 20px 8px; border-top: 1px solid #e8eef7; font-size: 8px; color: #7288a9; }.fleet-footer button { display: flex; align-items: center; gap: 5px; color: #6680a6; }.fleet-footnote { font-size: 7px; line-height: 1.7; color: #7c8fab; padding: 0 20px 13px; }
@media (max-width: 900px) { .seed-fleet { width: min(560px, 100%); margin-inline: auto; } }
@media (max-width: 600px) {
  .fleet-topline { padding: 12px; }.fleet-topline > span:first-child { font-size: 7px; letter-spacing: .2px; }.fleet-topline .demo-badge { font-size: 6px; }
  .fleet-diagram { padding: 17px 12px; }.seed-source { padding: 12px 10px; gap: 8px; }.seed-source-icon { width: 28px; height: 35px; }.seed-source-icon svg { width: 19px; }.seed-source-copy strong { font-size: 11px; }.seed-source-copy > div { gap: 4px; }.seed-source-copy > div > span { font-size: 6px; }.seed-source-copy p { font-size: 7px; }.seed-capacity > strong { font-size: 23px; }.seed-capacity > span { font-size: 5px; }.seed-capacity { padding-left: 7px; }
  .branch-label { font-size: 7px; gap: 4px; }.sandbox-branches { gap: 6px; margin: 0; }.agent-node { padding: 10px 6px 8px; }.agent-node-title { font-size: 9px; gap: 4px; }.agent-data { font-size: 6px; gap: 3px; }.agent-data svg { width: 10px; }.agent-private { font-size: 7px; padding: 6px 2px; }.agent-kube { font-size: 7px; gap: 3px; }.agent-kube svg { width: 11px; }.fleet-more { font-size: 6px; line-height: 1.7; }
  .shared-project { padding: 11px 9px; gap: 7px; }.shared-project > svg { width: 20px; }.shared-project strong { font-size: 10px; }.shared-project p { font-size: 7px; }.shared-project > span { font-size: 10px; }.shared-project small { font-size: 5px; letter-spacing: 0; }
  .fleet-controls, .inspector-content { padding: 16px 13px; }.storage-comparison { gap: 7px; grid-template-columns: 1fr 15px 1fr; }.storage-comparison > div > span { font-size: 5px; letter-spacing: .3px; }.storage-comparison strong { font-size: 32px; }.fleet-run { min-height: 42px; }.fleet-range-label { font-size: 10px; }.agent-inspector > summary { padding-inline: 13px; }
  .inspector-tabs { gap: 13px; }.machine-summary { font-size: 7px; }.private-layer { font-size: 8px; padding: 9px 7px; }.inspector-actions button { font-size: 8px; min-height: 35px; }.fleet-footer { padding-inline: 13px; }.fleet-footnote { padding-inline: 13px; }
}
</style>
