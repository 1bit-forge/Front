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

export function changePassword(params){
  return request('POST', '/api/users/change-password/', params, true)
}

export function updateProfile(params){
  return request('PATCH', '/api/users/profile/', params, true)
}
