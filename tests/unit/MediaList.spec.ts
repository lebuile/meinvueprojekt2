import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MediaList from '@/components/MediaList.vue'

describe('MediaList', () => {
  const testMedia = [
    { id: 1, title: 'Test Movie', type: 'MOVIE' },
    { id: 2, title: 'Test Series', type: 'SERIES' }
  ]

  it('rendert alle Medien-Items', () => {
    const wrapper = mount(MediaList, {
      props: {
        items: testMedia
      }
    })
    expect(wrapper.findAll('.media-item')).toHaveLength(2)
  })

  it('filtert Medien nach Typ', async () => {
    const wrapper = mount(MediaList, {
      props: {
        items: testMedia,
        filter: 'MOVIE'
      }
    })
    expect(wrapper.findAll('.media-item')).toHaveLength(1)
  })
})
