import { computed, ref } from 'vue'
import * as authApi from '@/api/auth'
import { ApiError } from '@/api/client'
import { getAccessToken, setAccessToken, removeToken, setRefreshToken, getRefreshToken } from '@/utils/cookie'

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} account
 * @property {string} username
 * @property {string|null} avatarUrl
 * @property {string} createdAt
 * @property {string} updatedAt
 */

const STORAGE_USER = 'lumina_auth_user'
const STORAGE_REMEMBER = 'lumina_remember_account'
const LEGACY_STORAGE_TOKEN = 'lumina_auth_token'

/** 清除 cookie token 與 localStorage user */
export function clearAuthData() {
  removeToken()
  localStorage.removeItem(STORAGE_USER)
  localStorage.removeItem(LEGACY_STORAGE_TOKEN)
}

export function logout() {
  clearAuthData()
}

export function isAuthenticated() {
  return Boolean(getRefreshToken())
}

export function getRememberedAccount() {
  return localStorage.getItem(STORAGE_REMEMBER) ?? ''
}

/** @returns {AuthUser|null} */
export function getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export { getAccessToken }

export function useAuth() {
  const loading = ref(false)
  const error = ref('')

  const authenticated = computed(() => isAuthenticated())

  function clearError() {
    error.value = ''
  }

  async function register({ account, username, password }) {
    clearError()
    loading.value = true
    try {
      await authApi.register({
        account: account.trim(),
        username: username.trim(),
        password,
      })
      return { ok: true }
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : '連線失敗，請稍後再試'
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  async function login({ account, password }) {
    clearError()
    loading.value = true
    try {
      const res = await authApi.login({
        account: account.trim(),
        password,
      })
      setAccessToken(res.data.access)
      setRefreshToken(removeStyle.data.refresh)
      localStorage.setItem(STORAGE_USER, JSON.stringify(res.data.user))
      return { ok: true, user: res.data.user }
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : '連線失敗，請稍後再試'
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  function logoutFromComposable() {
    logout()
    clearError()
  }

  function setRememberAccount(account, remember) {
    if (remember) {
      localStorage.setItem(STORAGE_REMEMBER, account.trim())
    } else {
      localStorage.removeItem(STORAGE_REMEMBER)
    }
  }

  return {
    loading,
    error,
    authenticated,
    register,
    login,
    logout: logoutFromComposable,
    setRememberAccount,
    clearError,
  }
}
