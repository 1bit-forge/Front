const EVENT_COLORS = ['blue', 'red', 'yellow', 'green']

export function getEventColorClass(eventId) {
    if (!eventId) {
        return `event-color-${EVENT_COLORS[0]}`
    }

    let hash = 0
    for (let i = 0; i < eventId.length; i++) {
        hash = (hash + eventId.charCodeAt(i)) % EVENT_COLORS.length
    }

    return `event-color-${EVENT_COLORS[hash]}`
}
