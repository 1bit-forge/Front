<script setup>
/**
 * scheme: delivery (merged from prompt-c r02)
 * 登錄頁：帳號、密碼、記住我、mock 認證
 */
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthField from '@/components/auth/AuthField.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import Btn from '@/components/Btn.vue'
import { useAuth, getRememberedAccount } from '@/composables/useAuth'
import { validateAccount, validatePassword } from '@/utils/authValidation'

const route = useRoute()
const router = useRouter()
const { login, loading, error, clearError, setRememberAccount } = useAuth()

const form = reactive({
  account: '',
  password: '',
})
const remember = ref(false)
const fieldErrors = reactive({
  account: '',
  password: '',
})

onMounted(() => {
  const saved = getRememberedAccount()
  if (saved) {
    form.account = saved
    remember.value = true
  }
})

function validateForm() {
  fieldErrors.account = validateAccount(form.account)
  fieldErrors.password = validatePassword(form.password)
  return !fieldErrors.account && !fieldErrors.password
}

async function handleSubmit() {
  clearError()
  if (!validateForm()) return

  setRememberAccount(form.account, remember.value)
  const result = await login({ account: form.account, password: form.password })
  if (result.ok) {
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  }
}

function onForgot() {
  ElMessage.info('忘記密碼功能尚未開放，請聯絡管理員。')
}
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Welcome back"
      subtitle="Access your organized workspace to stay productive."
    >
      <form @submit.prevent="handleSubmit">
        <p v-if="error" class="auth-form-error" role="alert">{{ error }}</p>

        <AuthField
          v-model="form.account"
          input-id="login-account"
          label="登入帳號"
          :error="fieldErrors.account"
          placeholder=""
          @enter="handleSubmit"
        />

        <PasswordField
          v-model="form.password"
          input-id="login-password"
          label="密碼"
          :error="fieldErrors.password"
          show-forgot
          @enter="handleSubmit"
          @forgot="onForgot"
        />

        <div class="auth-remember">
          <el-checkbox v-model="remember">記住我 30 天</el-checkbox>
        </div>

        <div class="auth-submit">
          <Btn type="submit" :disabled="loading">
            {{ loading ? '登入中…' : 'Sign in to Workspace' }}
          </Btn>
        </div>
      </form>

      <p class="auth-footer-text">
        還沒有帳號？
        <router-link to="/register">建立帳號</router-link>
      </p>
    </AuthCard>
  </AuthLayout>
</template>
