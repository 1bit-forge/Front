import { request } from '@/api/client'

export function getEventList(params) {
  return request('GET', `/api/calendar_core/events/?endTime=${params.endsAt}&startTime=${params.startsAt}`, undefined, true)
}

export function createEvent(params) {
  return request('POST', '/api/calendar_core/events/create/', params, true)
}

export function editEvent(params){
  return request('POST', '/api/calendar_core/events/edit/', params, true)
}

export function deleteEvent(params){
  return request('POST', '/api/calendar_core/events/delete/', params, true)
}