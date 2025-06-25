<template>
  <div class="star-rating">
    <span
      v-for="star in 5"
      :key="star"
      class="star"
      :class="{
        'filled': star <= (hoverRating || currentRating),
        'hoverable': !readonly
      }"
      @click="!readonly && setRating(star)"
      @mouseenter="!readonly && (hoverRating = star)"
      @mouseleave="!readonly && (hoverRating = 0)"
    >
      ★
    </span>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue?: number | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const hoverRating = ref(0)

const currentRating = computed(() => props.modelValue || 0)

const setRating = (rating: number) => {
  if (props.readonly) return

  if (rating === currentRating.value) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', rating)
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 3px;
}

.star {
  font-size: 22px;
  color: #e0e0e0;
  transition: all 0.2s ease;
  user-select: none;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.star.hoverable {
  cursor: pointer;
}

.star.filled {
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.star.hoverable:hover {
  color: #ffed4e;
  transform: scale(1.1);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
