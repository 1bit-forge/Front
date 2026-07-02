<template>
    <div class="calendar">
        <div class="calendar__weekdays">
            <span v-for="weekday in weekdays" :key="weekday" class="calendar__weekday">
                {{ weekday }}
            </span>
        </div>

        <div ref="calendarGridRef" class="calendar__grid"
            :class="totalDays === 35 ? 'calendar__grid-35' : 'calendar__grid-42'">
            <div v-for="(cell, index) in cells" :key="index" class="calendar__cell" :class="{
                'is-outside': !cell.isCurrentMonth,
                'is-today': cell.isToday,
            }" @click="createEvent()">
                <span class="calendar__day">{{ cell.day }}</span>

                <!-- 事件列表 -->
                <CalendarEvent v-for="{ event, continuesLeft, continuesRight, showTitle } in cell.events"
                    :key="`${event.eventId}-${cell.date.getTime()}`" :event="event" :continues-left="continuesLeft"
                    :continues-right="continuesRight" :show-title="showTitle"
                    :is-hovered="hoveredEventId === event.eventId" @pointerenter="onEventPointerEnter(event.eventId)"
                    @pointerleave="onEventPointerLeave($event, event.eventId)" @click.stop="editEvent(event)"
                    class="boxEvents" />
                <el-popover placement="left" :width="200" trigger="hover" v-if="cell.hasOverflow">
                    <template #reference>
                        <span class="calendar__cell-overflow">
                            還有+{{ cell.overflowCount }}
                        </span>
                    </template>
                    <div>
                        <div class="popover-dayInfo">
                            <p>週{{ weekMapping(cell.date.getDay()) }}</p>
                            <p>{{ cell.day }}</p>
                        </div>
                        <CalendarEvent v-for="{ event, continuesLeft, continuesRight, showTitle } in cell.allEvents"
                            :key="`${event.eventId}-${cell.date.getTime()}`" :event="event"
                            :continues-left="continuesLeft" :continues-right="continuesRight" :show-title="showTitle"
                            :is-hovered="popoverHoveredEventId === event.eventId"
                            @pointerenter="onPopoverEventPointerEnter(event.eventId)"
                            @pointerleave="onPopoverEventPointerLeave($event, event.eventId)"
                            @click.stop="editEvent(event)" class="boxEvents" />
                    </div>

                </el-popover>

            </div>
        </div>

        <MyDrawer v-model:drawer="showDrawer" :title="drawerTitle">
            <EventEdit :event-data="eventData" :mode="drawerMode" />
        </MyDrawer>
    </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, nextTick } from 'vue'
import CalendarEvent from './CalendarEvent.vue'
import EventEdit from './EventEdit.vue'
import MyDrawer from './MyDrawer.vue'

const hoveredEventId = ref(null)
const popoverHoveredEventId = ref(null)
const cellHeight = ref(100)
const calendarGridRef = ref(null)
const showPopover = ref(false)

function measureCellHeight() {
    if (calendarGridRef.value) {
        const cells = calendarGridRef.value.querySelectorAll('.calendar__cell')
        if (cells.length > 0) {
            cellHeight.value = cells[0].offsetHeight
        }
    }
}

onMounted(() => {
    nextTick(() => {
        measureCellHeight()
        window.addEventListener('resize', measureCellHeight)
    })
})

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

function onPopoverEventPointerEnter(eventId) {
    popoverHoveredEventId.value = eventId
}

function onPopoverEventPointerLeave(event, eventId) {
    const next = event.relatedTarget
    if (next instanceof Element && next.closest(`[data-event-id="${eventId}"]`)) {
        return
    }
    if (popoverHoveredEventId.value === eventId) {
        popoverHoveredEventId.value = null
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
function weekMapping(weekNumber){
    const dayMap = {
        0: "日",
        1: "一",
        2: "二",
        3: "三",
        4: "四",
        5: "五",
        6: "六"
    }
    return dayMap[weekNumber]
}

const EVENT_HEIGHT = 22
const DAY_LABEL_HEIGHT = 32

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

    const maxVisible = Math.max(1, Math.floor((cellHeight.value - DAY_LABEL_HEIGHT) / EVENT_HEIGHT))

    return Array.from({ length: totalDays.value }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)

        const allEvents = props.eventList
            .filter((event) => isDateInEventRange(date, event))
            .map((event) => ({
                event,
                continuesLeft: continuesLeft(date, event),
                continuesRight: continuesRight(date, event),
                showTitle: !continuesLeft(date, event),
            }))

        const hasOverflow = allEvents.length > maxVisible
        const visibleCount = hasOverflow ? maxVisible - 1 : maxVisible
        const overflowCount = allEvents.length - visibleCount

        return {
            date,
            day: date.getDate(),
            isCurrentMonth: date.getMonth() === month,
            isToday:
                date.getFullYear() === todayYear &&
                date.getMonth() === todayMonth &&
                date.getDate() === todayDay,
            events: allEvents.slice(0, visibleCount),
            allEvents,
            hasOverflow,
            overflowCount,
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
const drawerTitle = ref("")
const eventData = ref(null)
const drawerMode = ref("")

function createEvent() {
    eventData.value = null
    drawerTitle.value = "創建事件"
    drawerMode.value = "DETAIL"
    showDrawer.value = true

}

function editEvent(event) {
    eventData.value = event
    drawerTitle.value = "編輯事件"
    drawerMode.value = "EDIT"
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

.boxEvents {
    margin-bottom: 0.5vh;
}

.calendar__cell-overflow {
    width: 95%;
    margin: 0 auto;
    display: block;
    font-size: 12px;
    color: rgba(60, 60, 60, 0.6);
    margin-top: 2px;
}

.calendar__cell-overflow:hover {
    cursor: pointer;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    border-radius: 8px;
    z-index: 2;
}

.popover-dayInfo{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1vh;
    cursor: default;
}
</style>
