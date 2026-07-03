import { request } from '@/api/client'

export function register(params) {
  return request('POST', '/api/users/register/', params)
}

export function login(params) {
  return request('POST', '/api/users/login/', params)
}

export function refreshToken(params) {
  return request('POST', '/api/users/refresh/', params)
}
