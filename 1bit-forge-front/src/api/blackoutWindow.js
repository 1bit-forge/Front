import { request } from '@/api/client'

export function getBlackoutWindowList() {
  return request('GET', '/api/calendar_core/blackout-windows/', undefined, true)
}

export function createBlackoutWindow(params) {
  return request('POST', '/api/calendar_core/blackout-windows/create/', params, true)
}

export function editBlackoutWindow(params) {
  return request('POST', '/api/calendar_core/blackout-windows/edit/', params, true)
}

export function deleteBlackoutWindow(params) {
  return request('POST', '/api/calendar_core/blackout-windows/delete/', params, true)
}
