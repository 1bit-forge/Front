<script setup>
defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  inputId: { type: String, required: true },
  placeholder: { type: String, default: '' },
})

const model = defineModel({ type: String, default: '' })

defineEmits(['enter'])
</script>

<template>
  <div class="auth-field">
    <label class="auth-field__label" :for="inputId">{{ label }}</label>
    <div class="auth-field__input-wrap">
      <input
        :id="inputId"
        v-model="model"
        type="text"
        class="auth-field__input auth-field__input--plain"
        :class="{ 'auth-field__input--error': error }"
        :placeholder="placeholder"
        autocomplete="off"
        @keydown.enter="$emit('enter')"
      />
    </div>
    <p v-if="error" class="auth-field__error">{{ error }}</p>
    <p v-else-if="hint" class="auth-field__hint">{{ hint }}</p>
  </div>
</template>
