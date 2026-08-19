import { request } from '@/api/client'

export function getRecurringEventList() {
  return request('GET', '/api/calendar_core/recurring-events/', undefined, true)
}

export function createRecurringEvent(params) {
  return request('POST', '/api/calendar_core/recurring-events/create/', params, true)
}

export function editRecurringEvent(params) {
  return request('POST', '/api/calendar_core/recurring-events/edit/', params, true)
}

export function deleteRecurringEvent(params) {
  return request('POST', '/api/calendar_core/recurring-events/delete/', params, true)
}