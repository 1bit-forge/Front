import { getToken } from '@/utils/cookie'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
export async function request(method, path, options = {}) {
  const { body, auth = false } = options
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
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
