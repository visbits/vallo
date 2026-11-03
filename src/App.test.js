import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('Vallo website', () => {
  it('presents the brand and required product capabilities with a demo boundary', () => {
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toContain('Give your agents')
    for (const text of ['vallo.io', 'Virtual machines', 'Kubernetes', 'Block storage', 'Object storage', 'Billed by the hour', 'Browser-only simulation']) {
      expect(wrapper.text()).toContain(text)
    }
  })

  it('launches and resets the simulated environment', async () => {
    const wrapper = mount(App)
    expect(wrapper.find('.status-chip').text()).toBe('Ready to launch')
    await wrapper.get('#launch-demo').trigger('click')
    expect(wrapper.find('.status-chip').text()).toBe('Running')
    expect(wrapper.find('.terminal-content').text()).toContain('Kubernetes environment ready')
    await wrapper.get('#launch-demo').trigger('click')
    expect(wrapper.find('.status-chip').text()).toBe('Ready to launch')
    expect(wrapper.find('.terminal-content').text()).toContain('ready when you are')
  })

  it('updates Kubernetes and storage views consistently with launch state', async () => {
    const wrapper = mount(App)
    const tabs = wrapper.findAll('.console-tabs button')
    await tabs[1].trigger('click')
    expect(tabs[1].attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.terminal-content').text()).toContain('Pending')
    await wrapper.get('#launch-demo').trigger('click')
    expect(wrapper.find('.terminal-content').text()).toContain('1/1')
    expect(wrapper.find('.terminal-content').text()).not.toContain('Pending')
    await tabs[2].trigger('click')
    expect(wrapper.find('.terminal-content').text()).toContain('Attached')
    await wrapper.get('#launch-demo').trigger('click')
    expect(tabs[0].attributes('aria-pressed')).toBe('true')
    await tabs[2].trigger('click')
    expect(wrapper.find('.terminal-content').text()).toContain('Pending')
  })

  it('calculates each size at the minimum, default, and maximum runtimes', async () => {
    const wrapper = mount(App)
    for (const [id, cpu, ram, rate] of [['s', 2, 4, .04], ['m', 4, 8, .08], ['l', 8, 16, .16], ['xl', 16, 32, .32]]) {
      await wrapper.get(`input[value="${id}"]`).setValue()
      expect(wrapper.find('.resource-summary').text()).toContain(`${cpu} vCPU / ${ram} GB RAM`)
      for (const hours of [1, 8, 72]) {
        await wrapper.get('#hours').setValue(hours)
        expect(wrapper.get('[data-testid="estimate"]').text()).toBe(`$${(rate * hours).toFixed(2)}`)
      }
    }
    expect(wrapper.text()).toContain('Not a published price list')
  })

  it('opens mobile navigation and closes it when following a section link', async () => {
    const wrapper = mount(App)
    const toggle = wrapper.get('.mobile-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await wrapper.get('#mobile-nav a').trigger('click')
    expect(wrapper.find('#mobile-nav').exists()).toBe(false)
  })

  it('moves CTA focus to the demo launch control', async () => {
    const scroll = vi.fn()
    const wrapper = mount(App, { attachTo: document.body })
    wrapper.get('#sandbox-demo').element.scrollIntoView = scroll
    await wrapper.get('.hero-actions button').trigger('click')
    expect(scroll).toHaveBeenCalledWith({ block: 'center' })
    expect(document.activeElement.id).toBe('launch-demo')
    wrapper.unmount()
  })

  it('uses valid section anchors and native accessible FAQ disclosures', () => {
    const wrapper = mount(App)
    for (const link of wrapper.findAll('a[href^="#"]')) {
      const target = link.attributes('href')
      if (target !== '#') expect(wrapper.find(target).exists()).toBe(true)
    }
    const questions = wrapper.findAll('details')
    expect(questions).toHaveLength(5)
    for (const question of questions) {
      expect(question.find('summary').text().length).toBeGreaterThan(10)
      expect(question.find('p').text().length).toBeGreaterThan(30)
    }
  })
})
