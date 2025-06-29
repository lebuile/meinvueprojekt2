<template>
  <div>
    <div v-for="item in filteredItems" :key="item.id" class="media-item">
      {{ item.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  items: Array<{ id: number, title: string, type: string }>,
  filter?: string
}>()

const filteredItems = computed(() =>
  props.filter ? props.items.filter(item => item.type === props.filter) : props.items
)
</script>
