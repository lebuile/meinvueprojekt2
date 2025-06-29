import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  it('rendert den Titel korrekt', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.find('h1').text()).toBe('Meine Medienliste')
  })

  it('zeigt initial eine leere Liste an', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.findAll('.media-item')).toHaveLength(0)
  })
})
