/** Cookie 讀寫工具 */

const TOKEN_KEY = 'lumina_auth_token'
const TOKEN_MAX_AGE_DAYS = 7

export function getCookie(name) {
  const encoded = `${encodeURIComponent(name)}=`
  const parts = document.cookie.split('; ')
  for (const part of parts) {
    if (part.startsWith(encoded)) {
      return decodeURIComponent(part.slice(encoded.length))
    }
  }
  return ''
}

export function setCookie(name, value, maxAgeDays = TOKEN_MAX_AGE_DAYS) {
  const maxAge = maxAgeDays * 24 * 60 * 60
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`
}

export function removeCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`
}

export function getToken() {
  return getCookie(TOKEN_KEY)
}

export function setToken(token) {
  setCookie(TOKEN_KEY, token)
}

export function removeToken() {
  removeCookie(TOKEN_KEY)
}
