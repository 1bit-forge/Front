<template>
    <div class="calendar">
        <div class="calendar__weekdays">
            <span v-for="weekday in weekdays" :key="weekday" class="calendar__weekday">
                {{ weekday }}
            </span>
        </div>

        <div class="calendar__grid" :class="totalDays === 35 ? 'calendar__grid-35' : 'calendar__grid-42'">
            <div v-for="(cell, index) in cells" :key="index" class="calendar__cell" :class="{
                'is-outside': !cell.isCurrentMonth,
                'is-today': cell.isToday,
            }" @click="createEvent()">
                <span class="calendar__day">{{ cell.day }}</span>
                <CalendarEvent
                    v-for="{ event, continuesLeft, continuesRight, showTitle } in cell.events"
                    :key="`${event.eventId}-${cell.date.getTime()}`"
                    :event="event"
                    :continues-left="continuesLeft"
                    :continues-right="continuesRight"
                    :show-title="showTitle"
                    :is-hovered="hoveredEventId === event.eventId"
                    @pointerenter="onEventPointerEnter(event.eventId)"
                    @pointerleave="onEventPointerLeave($event, event.eventId)"
                />
            </div>
        </div>

        <MyDrawer v-model:drawer="showDrawer">
            <EventEdit></EventEdit>
        </MyDrawer>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CalendarEvent from './CalendarEvent.vue'
import MyDrawer from './MyDrawer.vue'

const hoveredEventId = ref(null)

function onEventPointerEnter(eventId) {
    hoveredEventId.value = eventId
}

function onEventPointerLeave(event, eventId) {
    const next = event.relatedTarget
    if (next instanceof Element && next.closest(`[data-event-id="${eventId}"]`)) {
        return
    }
    if (hoveredEventId.value === eventId) {
        hoveredEventId.value = null
    }
}

const props = defineProps({
    modelValue: {
        type: Date,
        default: () => new Date(),
    },
    eventList: {
        type: Array,
        default: []
    }
})

const emit = defineEmits(['update:modelValue'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

function toLocalDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isDateInEventRange(date, event) {
    const cellDate = toLocalDate(date)
    const startDate = toLocalDate(new Date(event.startTime))
    const endDate = toLocalDate(new Date(event.endTime))
    return cellDate >= startDate && cellDate <= endDate
}

function isSameDay(a, b) {
    const dateA = toLocalDate(a)
    const dateB = toLocalDate(b)
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    )
}

function isEventStartDay(date, event) {
    return isSameDay(date, new Date(event.startTime))
}

function isEventEndDay(date, event) {
    return isSameDay(date, new Date(event.endTime))
}

function continuesLeft(date, event) {
    if (isEventStartDay(date, event)) return false
    if (date.getDay() === 0) return false
    return true
}

function continuesRight(date, event) {
    if (isEventEndDay(date, event)) return false
    if (date.getDay() === 6) return false
    return true
}

const totalDays = computed(() => {
    const current = props.modelValue
    const year = current.getFullYear()
    const month = current.getMonth()

    const startOffset = new Date(year, month, 1).getDay()
    const startDate = new Date(year, month, 1 - startOffset)
    const endOffset = 6 - (new Date(year, month + 1, 0).getDay())
    const endDate = new Date(year, month + 1, 0 + endOffset)
    return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
})

const cells = computed(() => {
    const current = props.modelValue
    const year = current.getFullYear()
    const month = current.getMonth()

    const startOffset = new Date(year, month, 1).getDay()
    const startDate = new Date(year, month, 1 - startOffset)

    const today = new Date()
    const todayYear = today.getFullYear()
    const todayMonth = today.getMonth()
    const todayDay = today.getDate()

    return Array.from({ length: totalDays.value }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)

        return {
            date,
            day: date.getDate(),
            isCurrentMonth: date.getMonth() === month,
            isToday:
                date.getFullYear() === todayYear &&
                date.getMonth() === todayMonth &&
                date.getDate() === todayDay,
            events: props.eventList
                .filter((event) => isDateInEventRange(date, event))
                .map((event) => ({
                    event,
                    continuesLeft: continuesLeft(date, event),
                    continuesRight: continuesRight(date, event),
                    showTitle: !continuesLeft(date, event),
                })),
        }
    })
})

const selectDate = (type) => {
    if (type === 'today') {
        emit('update:modelValue', new Date())
        return
    }

    const next = new Date(props.modelValue)

    if (type === 'prev-month') {
        next.setMonth(next.getMonth() - 1)
    } else if (type === 'next-month') {
        next.setMonth(next.getMonth() + 1)
    }

    emit('update:modelValue', next)
}

defineExpose({ selectDate })


const showDrawer = ref(false)

function createEvent() {
    showDrawer.value = true
}
</script>

<style scoped>
.calendar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--White);
}

.calendar__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding-bottom: 8px;
}

.calendar__weekday {
    text-align: center;
    font-size: 14px;
    color: rgba(60, 60, 60, 0.66);
}

.calendar__grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-right: 1px solid rgba(60, 60, 60, 0.12);
    border-bottom: 1px solid rgba(60, 60, 60, 0.12);

}

.calendar__grid-35 {
    grid-template-rows: repeat(5, 1fr);
}

.calendar__grid-42 {
    grid-template-rows: repeat(6, 1fr);
}

.calendar__cell {
    border-top: 1px solid rgba(60, 60, 60, 0.12);
    border-left: 1px solid rgba(60, 60, 60, 0.12);
    overflow: visible;
    color: var(--Black);
}

.calendar__cell.is-outside {
    color: #ccc;
}

.calendar__cell.is-today {
    background: #ebf5ff;
}

.calendar__cell.is-today .calendar__day {
    color: var(--Primary);
}

.calendar__day {
    display: block;
    line-height: 1;

    margin: 8px;
}
</style>
