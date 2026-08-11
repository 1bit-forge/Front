<script setup>
import { ref } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'

defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  inputId: { type: String, required: true },
  showForgot: { type: Boolean, default: false },
})

const model = defineModel({ type: String, default: '' })
defineEmits(['enter', 'forgot'])

const visible = ref(false)
</script>

<template>
  <div class="auth-field">
    <div class="auth-field__label-row">
      <label class="auth-field__label" :for="inputId">{{ label }}</label>
      <a
        v-if="showForgot"
        href="#"
        class="auth-field__link"
        @click.prevent="$emit('forgot')"
      >
        忘記密碼？
      </a>
    </div>
    <div class="auth-field__input-wrap">
      <input
        :id="inputId"
        v-model="model"
        :type="visible ? 'text' : 'password'"
        class="auth-field__input"
        :class="{ 'auth-field__input--error': error }"
        autocomplete="current-password"
        @keydown.enter="$emit('enter')"
      />
      <button
        type="button"
        class="auth-field__toggle"
        :aria-label="visible ? '隱藏密碼' : '顯示密碼'"
        tabindex="-1"
        @click="visible = !visible"
      >
        <el-icon :size="18">
          <View v-if="!visible" />
          <Hide v-else />
        </el-icon>
      </button>
    </div>
    <p v-if="error" class="auth-field__error">{{ error }}</p>
    <p v-else-if="hint" class="auth-field__hint">{{ hint }}</p>
  </div>
</template>
