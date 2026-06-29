<script setup>
/**
 * scheme: delivery (merged from prompt-c r02)
 * 註冊頁：username、account、password
 */
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthField from '@/components/auth/AuthField.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import Btn from '@/components/Btn.vue'
import { useAuth } from '@/composables/useAuth'
import {
  validateAccount,
  validateUsername,
  validatePassword,
} from '@/utils/authValidation'

const router = useRouter()
const { register, loading, error, clearError } = useAuth()

const form = reactive({
  username: '',
  account: '',
  password: '',
})
const fieldErrors = reactive({
  username: '',
  account: '',
  password: '',
})

function validateForm() {
  fieldErrors.username = validateUsername(form.username)
  fieldErrors.account = validateAccount(form.account)
  fieldErrors.password = validatePassword(form.password)
  return (
    !fieldErrors.username && !fieldErrors.account && !fieldErrors.password
  )
}

async function handleSubmit() {
  clearError()
  if (!validateForm()) return

  const result = await register({
    account: form.account,
    username: form.username,
    password: form.password,
  })
  if (result.ok) {
    await router.push('/login')
  }
}
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Create account"
      subtitle="Build your workspace in minutes."
    >
      <form @submit.prevent="handleSubmit">
        <p v-if="error" class="auth-form-error" role="alert">{{ error }}</p>

        <AuthField
          v-model="form.username"
          input-id="register-username"
          label="姓名／暱稱"
          :error="fieldErrors.username"
          placeholder=""
          @enter="handleSubmit"
        />

        <AuthField
          v-model="form.account"
          input-id="register-account"
          label="登入帳號"
          :error="fieldErrors.account"
          placeholder=""
          @enter="handleSubmit"
        />

        <PasswordField
          v-model="form.password"
          input-id="register-password"
          label="密碼"
          :error="fieldErrors.password"
          hint="至少 8 個字元且須包含至少一個數字"
          @enter="handleSubmit"
        />

        <div class="auth-submit">
          <Btn type="submit" :disabled="loading">
            {{ loading ? '建立中…' : 'Create account' }}
          </Btn>
        </div>
      </form>

      <p class="auth-footer-text">
        已有帳號？
        <router-link to="/login">登錄</router-link>
      </p>
    </AuthCard>
  </AuthLayout>
</template>
