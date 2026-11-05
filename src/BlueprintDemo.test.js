import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BlueprintDemo from './BlueprintDemo.vue'

const run = async (wrapper) => {
  for (let step = 0; step < 4; step += 1) {
    await wrapper.get('.bp-actions .button').trigger('click')
  }
}

describe('controller concept', () => {
  it('offers both entry points without requiring a Vallo planner for direct execution', async () => {
    const wrapper = mount(BlueprintDemo)
    expect(wrapper.get('#blueprint-entry').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.bp-entry-note').text()).toContain('20 repos + Helm + Terraform')
    await wrapper.findAll('.bp-entry button')[1].trigger('click')
    expect(wrapper.get('.bp-entry-note').text()).toContain('No Vallo planner required')
    expect(wrapper.text()).toContain('Browser-only simulation')
    expect(wrapper.text()).toContain('No repository or object storage is connected')
  })

  it('progresses through all stages and reports a scripted failure with optional diagnosis', async () => {
    const wrapper = mount(BlueprintDemo)
    for (let stage = 1; stage <= 4; stage += 1) {
      await wrapper.get('.bp-actions .button').trigger('click')
      expect(wrapper.findAll('.bp-stages .done')).toHaveLength(stage)
      expect(wrapper.find('.bp-result').exists()).toBe(stage === 4)
    }
    expect(wrapper.get('[role="status"]').text()).toContain('47 checks passed. 1 failed')
    expect(wrapper.get('.bp-actions .button').element.disabled).toBe(true)
    expect(wrapper.find('#bp-diagnosis').exists()).toBe(false)
    await wrapper.get('.bp-result button').trigger('click')
    expect(wrapper.get('#bp-diagnosis').text()).toContain('scripted hypothesis, not a live analysis')
    expect(wrapper.get('.bp-delivery').text()).toContain('Nothing is sent')
    await wrapper.get('.bp-result button').trigger('click')
    expect(wrapper.find('#bp-diagnosis').exists()).toBe(false)
  })

  it('replays a distinct pinned baseline and clears previous results when the release changes', async () => {
    const wrapper = mount(BlueprintDemo)
    await run(wrapper)
    await wrapper.get('.bp-result button').trigger('click')
    await wrapper.get('#blueprint-release').setValue('r41')
    expect(wrapper.find('.bp-result').exists()).toBe(false)
    expect(wrapper.findAll('.bp-stages .done')).toHaveLength(0)
    expect(wrapper.get('.bp-pins').text()).toContain('3a9f610')
    expect(wrapper.get('.bp-manifest').text()).toContain('blueprints/commerce/r41.json')
    expect(wrapper.get('.bp-manifest').text()).toContain(`sha256:${'b'.repeat(64)}`)
    await run(wrapper)
    expect(wrapper.get('[role="status"]').text()).toContain('48 checks passed')
    expect(wrapper.find('.bp-result button').exists()).toBe(false)
    expect(wrapper.get('.bp-replay').text()).toContain('does not restore historical database state')
  })

  it('resets runs on entry changes and supports rerunning the selected release', async () => {
    const wrapper = mount(BlueprintDemo)
    await run(wrapper)
    await wrapper.findAll('.bp-entry button')[1].trigger('click')
    expect(wrapper.find('.bp-result').exists()).toBe(false)
    await wrapper.get('#blueprint-release').setValue('r41')
    await run(wrapper)
    await wrapper.get('.bp-reset').trigger('click')
    expect(wrapper.get('#blueprint-release').element.value).toBe('r41')
    expect(wrapper.findAll('.bp-stages .done')).toHaveLength(0)
    expect(wrapper.get('.bp-actions .button').element.disabled).toBe(false)
  })
})
