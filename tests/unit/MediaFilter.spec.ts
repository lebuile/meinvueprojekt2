import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MediaFilter from '@/components/MediaFilter.vue'

describe('MediaFilter', () => {
  it("emittiert filter-change Event bei Typ-Änderung", async () => {
    const wrapper = mount(MediaFilter)
    const select = wrapper.find('select')
    await select.setValue('movie')  // 'movie' statt 'MOVIE'
    expect(wrapper.emitted('filter-change')).toBeTruthy()
    expect(wrapper.emitted('filter-change')?.[0]).toEqual(['movie'])  // 'movie' statt 'MOVIE'
  })

  it('zeigt alle Filter-Optionen an', () => {
    const wrapper = mount(MediaFilter)
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3) // Alle, Film, Serie
  })
})
