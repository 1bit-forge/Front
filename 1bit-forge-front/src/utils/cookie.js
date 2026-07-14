/** Cookie 讀寫工具 */

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
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
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax${secure}`
}

export function getAccessToken() {
  return getCookie(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token) {
  setCookie(ACCESS_TOKEN_KEY, token)
}

export function getRefreshToken(){
  return getCookie(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token) {
  setCookie(REFRESH_TOKEN_KEY, token)
}

export function removeToken() {
  removeCookie(ACCESS_TOKEN_KEY)
  removeCookie(REFRESH_TOKEN_KEY);
}
