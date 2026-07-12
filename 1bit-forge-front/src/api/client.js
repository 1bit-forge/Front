import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  removeToken,
} from '@/utils/cookie'
import { refreshToken } from '@/api/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

let refreshPromise = null

function redirectToLogin() {
  window.location.href = '/login'
}

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/**
 * @param {string} method
 * @param {string} path
 * @param {{ body?: object, auth?: boolean }} [options]
 */
export async function request(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('連線失敗，請稍後再試', 0)
  }

  if (res.status === 401 && auth) {
    if (!getRefreshToken()) {
      redirectToLogin()
      throw new ApiError('請重新登入', 401)
    }

    if (refreshPromise) {
      await refreshPromise
      return request(method, path, body, auth)
    }

    refreshPromise = refreshToken({ refresh: getRefreshToken() })
      .then(res => {
        setAccessToken(res.data.access)
        if (res.data.refresh) {
          setRefreshToken(res.data.refresh)
        }
      })
      .catch(() => {
        removeToken()
        redirectToLogin()
        throw new ApiError('請重新登入', 401)
      })
      .finally(() => {
        refreshPromise = null
      })

    await refreshPromise
    return request(method, path, body, auth)
  }

  let json
  try {
    json = await res.json()
  } catch {
    throw new ApiError('連線失敗，請稍後再試', res.status)
  }

  const code = json.code ?? res.status
  if (code < 200 || code >= 300) {
    throw new ApiError(json.message || '操作失敗', code)
  }

  return json
}
