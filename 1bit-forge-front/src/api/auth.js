import { request } from '@/api/client'

export function register({ account, username, password }) {
  return request('POST', '/api/calendar_core/auth/register', {
    body: { account, username, password },
  })
}

export function login({ account, password }) {
  return request('POST', '/api/calendar_core/auth/login', {
    body: { account, password },
  })
}
