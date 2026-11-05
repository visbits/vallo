<script setup>
import { computed, ref } from 'vue'
import { ArrowDown, ArrowRight, Box, Check, Code2, Database, GitBranch, Layers3, Play, RotateCcw, ShipWheel, Terminal, Workflow } from '@lucide/vue'

const entry = ref('repositories')
const release = ref('r42')
const stage = ref(0)
const diagnosisOpen = ref(false)
const releases = {
  r42: { name: 'r42 · feature/checkout', revision: '8c4e2b1', image: 'checkout:2.4.0', digest: 'c'.repeat(64), outcome: 'failed' },
  r41: { name: 'r41 · integration baseline', revision: '3a9f610', image: 'checkout:2.3.1', digest: 'b'.repeat(64), outcome: 'passed' },
}
const selected = computed(() => releases[release.value])
const steps = ['Resolve', 'Deploy', 'Test', 'Report']
const complete = computed(() => stage.value === steps.length)
const summary = computed(() => {
  if (!stage.value) return 'Ready to resolve a versioned deployment formula.'
  if (stage.value === 1) return '20 repository revisions, component images, and seed versions pinned.'
  if (stage.value === 2) return 'Illustrative cluster, services, and workers are ready.'
  if (stage.value === 3) return 'Integration checks finished. Evidence collected for this run.'
  return selected.value.outcome === 'failed'
    ? '47 checks passed. 1 failed. Review the evidence before changing code.'
    : '48 checks passed in this saved baseline example.'
})

function reset() {
  stage.value = 0
  diagnosisOpen.value = false
}

function chooseEntry(value) {
  entry.value = value
  reset()
}

function advance() {
  if (!complete.value) stage.value += 1
}
</script>

<template>
  <section class="blueprint-demo" aria-label="Interactive blueprint controller concept">
    <div class="bp-top"><span><Workflow :size="15" /> VALLO / CONTROLLER</span><span class="demo-badge">CONCEPT DEMO</span></div>
    <div class="bp-body">
      <div class="bp-label">01 / TWO WAYS IN</div>
      <div class="bp-entry" aria-label="Choose an entry point">
        <button id="blueprint-entry" :aria-pressed="entry === 'repositories'" @click="chooseEntry('repositories')"><GitBranch :size="17" /><strong>Bring your repos</strong><small>Agent-assisted composition</small></button>
        <button :aria-pressed="entry === 'agent'" @click="chooseEntry('agent')"><Terminal :size="17" /><strong>Bring your agent</strong><small>Your orchestration. Our execution.</small></button>
      </div>
      <p class="bp-entry-note">{{ entry === 'repositories' ? '20 repos + Helm + Terraform → a reviewable environment blueprint.' : 'Your agent or CI invokes a saved profile. No Vallo planner required.' }}</p>
      <div class="bp-connector"><ArrowDown :size="16" /><span>One execution system</span></div>
      <div class="bp-release">
        <div class="bp-release-title"><div><Layers3 :size="17" /><strong>commerce.integration</strong></div><span>BLUEPRINT</span></div>
        <label for="blueprint-release">Saved release</label>
        <select id="blueprint-release" v-model="release" @change="reset"><option v-for="(item, id) in releases" :key="id" :value="id">{{ item.name }}</option></select>
        <div class="bp-pins"><span><GitBranch :size="12" /> {{ selected.revision }} <small>example commit</small></span><span><Box :size="12" /> {{ selected.image }}</span></div>
        <details class="bp-manifest"><summary>Inspect the release record <Code2 :size="12" /></summary><dl><dt>Object storage</dt><dd>blueprints/commerce/{{ release }}.json</dd><dt>Image pin · illustrative</dt><dd>sha256:{{ selected.digest }}</dd><dt>Other repositories</dt><dd>19 pinned baseline revisions</dd><dt>Data seed</dt><dd>commerce-fixtures / v7</dd></dl><p>Example identifiers only. No repository or object storage is connected.</p></details>
      </div>
      <div class="bp-connector"><ArrowDown :size="16" /><span>Compose only what the stack needs</span></div>
      <div class="bp-infra">
        <div class="bp-cluster"><header><ShipWheel :size="16" /><strong>Kubernetes</strong><small>OPTIONAL MODULE</small></header><div class="bp-services"><span><Code2 :size="16" />App + API</span><span><Database :size="16" />Database</span><span><Workflow :size="16" />Queue</span></div></div>
        <div class="bp-workers"><Terminal :size="17" /><strong>Test workers</strong><span>Ephemeral jobs</span><small>VM profiles when needed</small></div>
      </div>
      <div class="bp-foundation">OpenStack foundation <span>Isolated compute · networks · seed-backed storage</span></div>
      <div class="bp-label bp-run-label">02 / REPEATABLE EXECUTION</div>
      <ol class="bp-stages" aria-label="Run progress"><li v-for="(step, index) in steps" :key="step" :class="{ done: stage > index }"><Check v-if="stage > index" :size="12" /><span v-else>{{ index + 1 }}</span>{{ step }}</li></ol>
      <p class="bp-status" role="status">{{ summary }}</p>
      <div v-if="complete" class="bp-result" :class="{ failed: selected.outcome === 'failed' }">
        <strong>{{ selected.outcome === 'failed' ? 'Checkout contract mismatch' : 'Baseline integration checks passed' }}</strong>
        <p>{{ selected.outcome === 'failed' ? 'checkout.integration · expected total, received amount' : 'The recorded component combination passes this simulated test suite.' }}</p>
        <button v-if="selected.outcome === 'failed'" :aria-expanded="diagnosisOpen" aria-controls="bp-diagnosis" @click="diagnosisOpen = !diagnosisOpen">Review agent diagnosis <ArrowRight :size="13" /></button>
        <div v-if="diagnosisOpen" id="bp-diagnosis"><p><strong>Likely cause:</strong> the API response changed while the consumer still expects the previous field. This is a scripted hypothesis, not a live analysis.</p><p>Proposed next step: update the consumer contract, rerun tests, and request approval before opening a repair PR.</p></div>
        <div class="bp-delivery">Evidence → GitHub check / Slack <small>Delivery is simulated. Nothing is sent.</small></div>
      </div>
      <div class="bp-actions"><button class="button button-blue" :disabled="complete" @click="advance"><Play :size="13" />{{ complete ? 'Example run complete' : stage === 0 ? 'Run the blueprint' : `Continue to ${steps[stage].toLowerCase()}` }}</button><button class="bp-reset" @click="reset"><RotateCcw :size="13" /> Reset run</button></div>
      <p class="bp-replay">Try r41 to replay the baseline formula. Replaying software does not restore historical database state.</p>
    </div>
    <div class="bp-footer">Browser-only simulation · no provisioning, model calls, or charges</div>
  </section>
</template>

<style scoped>
.blueprint-demo { min-width: 0; border: 1px solid #cbdaf3; border-radius: 15px; background: #fff; box-shadow: 0 25px 70px -30px #235cf568; overflow: clip; }
.bp-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 15px 19px; border-bottom: 1px solid #e3ebf7; background: #f8faff; }.bp-top > span:first-child { display: flex; align-items: center; gap: 8px; font: 9px var(--font-mono); letter-spacing: .7px; color: #4c6b9e; }
.bp-body { padding: 20px; }.bp-label { font: 8px var(--font-mono); color: #6b83a6; letter-spacing: 1.2px; margin-bottom: 10px; }
.bp-entry { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }.bp-entry button { text-align: left; display: grid; gap: 7px; padding: 12px; border: 1px solid #dce5f4; border-radius: 8px; color: #657d9d; background: #fafcff; }.bp-entry button[aria-pressed="true"] { color: #235cf5; border-color: #789ffa; background: #eff5ff; box-shadow: 0 0 0 2px #235cf50a; }.bp-entry strong { font-size: 12px; }.bp-entry small { font-size: 9px; line-height: 1.5; }.bp-entry-note { font-size: 10px; line-height: 1.7; color: #60799d; margin-top: 10px; }
.bp-connector { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 0; font-size: 9px; color: #7f96b6; }
.bp-release { border-radius: 9px; padding: 15px; color: #d8e7ff; background: linear-gradient(120deg, #163767, #1d4d9a); }.bp-release-title, .bp-release-title > div { display: flex; align-items: center; gap: 8px; }.bp-release-title { justify-content: space-between; flex-wrap: wrap; }.bp-release-title strong { font-size: 12px; color: #fff; }.bp-release-title > span { font: 7px var(--font-mono); letter-spacing: 1px; }.bp-release label { display: block; margin-block: 13px 5px; font-size: 9px; }.bp-release select { width: 100%; min-height: 34px; border: 1px solid #7ca0d7; border-radius: 5px; padding: 5px 8px; color: #173966; background: #f3f7ff; font: 10px var(--font-mono); }
.bp-pins { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-top: 10px; font: 9px var(--font-mono); }.bp-pins > span { display: flex; align-items: center; gap: 5px; }.bp-pins small { color: #a5c1e8; font-size: 8px; }
.bp-manifest { margin-top: 12px; font-size: 9px; }.bp-manifest summary { display: flex; justify-content: space-between; list-style: none; }.bp-manifest dl { display: grid; gap: 5px; margin-top: 12px; }.bp-manifest dt { color: #a5c1e8; }.bp-manifest dd { font-family: var(--font-mono); overflow-wrap: anywhere; margin: 0 0 5px; }.bp-manifest p { line-height: 1.6; margin-top: 7px; }
.bp-infra { display: grid; grid-template-columns: 2fr 1fr; gap: 9px; }.bp-cluster { border: 1px solid #c6d9f7; border-radius: 8px; padding: 12px; background: #f5f9ff; }.bp-cluster header { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; color: #3969b0; font-size: 10px; }.bp-cluster header small { font-size: 6px; margin-left: auto; }.bp-services { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 14px; }.bp-services > span { display: flex; flex-direction: column; align-items: center; gap: 7px; color: #6482a8; font-size: 8px; text-align: center; }
.bp-workers { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 12px; border: 1px solid #cae2dc; border-radius: 8px; background: #f3faf8; color: #417e73; }.bp-workers strong { font-size: 10px; }.bp-workers span, .bp-workers small { font-size: 8px; line-height: 1.6; }
.bp-foundation { padding: 10px; margin-top: 9px; border: 1px dashed #d5dfef; border-radius: 5px; font-size: 9px; color: #5c759a; }.bp-foundation span { display: block; margin-top: 4px; font-size: 8px; color: #7a8fac; }
.bp-run-label { margin-top: 22px; }.bp-stages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; padding: 0; list-style: none; }.bp-stages li { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 3px; background: #f1f5fb; border-radius: 4px; color: #7389a8; font-size: 9px; }.bp-stages li > span { font: 8px var(--font-mono); }.bp-stages li.done { background: #eaf7f1; color: #22806a; }
.bp-status { min-height: 34px; font-size: 10px; line-height: 1.7; margin-block: 12px; color: #557096; }.bp-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }.bp-actions .button { min-height: 39px; font-size: 10px; flex: 1; }.bp-actions .button:disabled { opacity: .6; transform: none; }.bp-reset { display: flex; gap: 5px; align-items: center; color: #627c9f; font-size: 9px; min-height: 36px; }
.bp-result { padding: 13px; margin-bottom: 15px; border: 1px solid #bce3d5; background: #f0faf5; border-radius: 7px; font-size: 10px; color: #287661; }.bp-result.failed { background: #fff9ed; border-color: #f0d6a4; color: #865e25; }.bp-result p { font-size: 9px; line-height: 1.8; margin-top: 7px; }.bp-result button { display: flex; align-items: center; gap: 7px; margin-top: 10px; font-size: 10px; min-height: 32px; }.bp-delivery { border-top: 1px solid #d6c7a544; margin-top: 10px; padding-top: 10px; font-size: 9px; }.bp-delivery small { display: block; margin-top: 4px; font-size: 8px; }
.bp-replay { font-size: 9px; line-height: 1.8; margin-top: 12px; color: #7186a5; }.bp-footer { padding: 12px 18px; font-size: 8px; color: #788bab; background: #f8faff; border-top: 1px solid #e4ecf8; line-height: 1.7; }
@media (max-width: 600px) { .bp-body { padding: 14px; }.bp-top { padding: 12px; }.bp-top > span:first-child { font-size: 8px; }.bp-entry button { padding: 10px; }.bp-entry strong { font-size: 11px; }.bp-entry small { font-size: 8px; }.bp-cluster, .bp-workers { padding: 9px; }.bp-cluster header small { width: 100%; margin-left: 0; }.bp-services { gap: 3px; }.bp-services > span { font-size: 7px; }.bp-stages li { font-size: 8px; } }
</style>
