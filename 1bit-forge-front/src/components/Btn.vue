<template>
    <button
      :type="type"
      class="btn"
      :class="{ 'btn--fit-content': fitContent, ['btn--hover-' + hover]: true }"
      :style="buttonStyle"
      :disabled="disabled"
    >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const THEME_COLORS = {
  primary: 'var(--Primary)',
  secondary: 'var(--Secondary)',
  tertiary: 'var(--Tertiary)',
  neutral: 'var(--Neutral)',
  white: 'var(--White)'
}

const props = defineProps({
  color: {
    type: String,
    default: 'primary',
  },
  fitContent: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hover: {
    type: String,
    default: "light"
  }
})

const buttonStyle = computed(() => ({
  backgroundColor: THEME_COLORS[props.color] ?? props.color,
  color: props.color === 'neutral' ? 'var(--Secondary)' : '#fff',
}))
</script>

<style scoped>
.btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  font-family: inherit;
}

.btn--fit-content {
  width: fit-content;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn--hover-light:hover {
  filter: brightness(1.15);
}

.btn--hover-dark:hover {
  filter: brightness(0.85);
}
</style>
