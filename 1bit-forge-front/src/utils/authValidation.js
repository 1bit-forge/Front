/** 認證表單校驗（對齊數據模型與設計提示） */

const ACCOUNT_MIN = 3
const ACCOUNT_MAX = 32
const USERNAME_MAX = 50
const PASSWORD_PATTERN = /^(?=.*\d).{8,}$/

export function validateAccount(value) {
  const v = (value ?? '').trim()
  if (!v) return '請輸入登入帳號'
  if (v.length < ACCOUNT_MIN || v.length > ACCOUNT_MAX) {
    return `登入帳號需為 ${ACCOUNT_MIN}–${ACCOUNT_MAX} 個字元`
  }
  return ''
}

export function validateUsername(value) {
  const v = (value ?? '').trim()
  if (!v) return '請輸入姓名或暱稱'
  if (v.length > USERNAME_MAX) return `姓名或暱稱不可超過 ${USERNAME_MAX} 個字元`
  return ''
}

export function validatePassword(value) {
  const v = value ?? ''
  if (!v) return '請輸入密碼'
  if (!PASSWORD_PATTERN.test(v)) {
    return '密碼至少 8 個字元且須包含至少一個數字'
  }
  return ''
}
