import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Navigation from "../../src/components/Navigation.vue";
import { createRouter, createMemoryHistory } from "vue-router";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/about', name: 'about', component: { template: '<div>About</div>' } }
  ]
})

describe("Navigation", () => {
  it("rendert alle Navigation-Links", async () => {
    const wrapper = mount(Navigation, {
      global: {
        plugins: [router]
      }
    })
    await router.isReady()

    const links = wrapper.findAll('.nav-link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Home')
    expect(links[1].text()).toBe('About')
  })

  it("markiert den aktiven Link", async () => {
    const wrapper = mount(Navigation, {
      global: {
        plugins: [router]
      }
    })
    await router.isReady()
    await router.push('/about')
    await wrapper.vm.$nextTick()

    const aboutLink = wrapper.findAll('.nav-link')[1]
    expect(aboutLink.classes()).toContain('router-link-active')
  })
})
