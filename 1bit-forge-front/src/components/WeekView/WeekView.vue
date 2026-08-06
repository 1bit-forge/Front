<template>
    <div class="week-view">
        <!-- 頁首：七欄星期顯示與時間軸標籤共用一列，由 day-list 與 time-axis 共同撐起 -->
        <div class="week-view__head">
            <!-- 左側時間軸留白：與內容區的固定寬度 80px 對齊 -->
            <div class="week-view__time-axis-head"></div>

            <!-- 七欄星期日～六欄首；標示今日所在的欄 -->
            <div class="week-view__weekdays">
                <div
                    v-for="(col, index) in weekColumns"
                    :key="`${col.date.getTime()}-${index}`"
                    class="week-view__weekday"
                    :class="{ 'is-today': col.isToday }"
                >
                    <span class="week-view__weekday-name">{{ col.weekdayName }}</span>
                    <span class="week-view__weekday-date">{{ col.dayNumber }}</span>
                </div>
            </div>
        </div>

        <!-- 主體：左側時間軸 + 右側七欄事件內容；高度由內容區決定，垂直捲動加在主體上 -->
        <div class="week-view__body">
            <!-- 左側時間軸：每小時一格，每格高度為 60px -->
            <div class="week-view__time-axis">
                <div v-for="hour in hours" :key="hour" class="week-view__time-label">
                    {{ hour }}
                </div>
            </div>

            <!-- 七欄內容並排，每欄對應一個本地日期；點擊欄內空白呼叫 createEvent -->
            <div class="week-view__columns">
                <div
                    v-for="(col, index) in weekColumns"
                    :key="`body-${col.date.getTime()}-${index}`"
                    class="week-view__column"
                    @click="createEvent(col.date)"
                >
                    <!-- 24 條橫向背景格線，每條高度 60px -->
                    <div v-for="hour in hours" :key="`grid-${index}-${hour}`" class="week-view__grid-line"></div>

                    <!-- 該日事件分欄後以絕對定位呈現 -->
                    <DayViewEvent
                        v-for="layout in col.layouts"
                        :key="layout.event.eventId"
                        :event="layout.event"
                        :top="layout.startMinutes"
                        :height="layout.endMinutes - layout.startMinutes"
                        :left="layout.left"
                        :width="layout.width"
                        @click.stop="editEvent(layout.event)"
                    />
                </div>
            </div>
        </div>

        <MyDrawer v-model:drawer="showDrawer" :title="drawerTitle">
            <EventEdit :event-data="eventData" :mode="drawerMode" calendarType="DAY"
                @update:drawer="showDrawer = false"
                @createEvent="emit('createEvent')"
                @loadData="emit('createEvent')" />
        </MyDrawer>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import DayViewEvent from '../DayView/DayViewEvent.vue'
import MyDrawer from '../MyDrawer.vue'
import EventEdit from '../EventEdit.vue'

const props = defineProps({
    eventList: {
        type: Array,
        default: () => [],
    },
    selectedDate: {
        type: Date,
        default: () => new Date(),
    },
})

const emit = defineEmits(['createEvent'])

/**
 * 時間軸常數：1 小時 = 60px（與 DayView 一致），top / height 直接以分鐘數當像素值。
 */
const HOUR_HEIGHT = 60

/**
 * 星期顯示順序：星期日起算，與欄位順序一致。
 */
const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 產生 00:00 ~ 23:00 的小時標籤陣列。
 */
const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`,
)

/**
 * 取得本地日期的正午 Date，用於避免時區位移造成日期錯位。
 */
function toLocalNoon(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
}

/**
 * 由任一日回溯到當週星期日 00:00（同本地時區）。
 */
function getWeekStart(date) {
    const base = toLocalNoon(date)
    base.setDate(base.getDate() - base.getDay())
    base.setHours(0, 0, 0, 0)
    return base
}

/**
 * 計算當日 [00:00, 次日 00:00) 區間。
 */
function getDayBounds(selectedDate) {
    const base = selectedDate ?? new Date()
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0)
    const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1, 0, 0, 0, 0)
    return { start, end }
}

/**
 * 將 ISO 時間字串解析為 Date；無效則回傳 null。
 */
function parseEventDate(timeStr) {
    const date = new Date(timeStr)
    return Number.isNaN(date.getTime()) ? null : date
}

/**
 * 計算事件與當日區間的交集，並回傳當日內的 [startMinutes, endMinutes]。
 * 規則與 DayView 相同：半開區間相交、結束恰為當日 00:00 視為前一日終點。
 */
function clipEventToDay(event, dayStart, dayEnd) {
    const eventStart = parseEventDate(event.startsAt)
    const eventEnd = parseEventDate(event.endsAt)
    if (!eventStart || !eventEnd || eventEnd <= eventStart) {
        return null
    }

    const clipStart = eventStart > dayStart ? eventStart : dayStart
    const clipEnd = eventEnd < dayEnd ? eventEnd : dayEnd
    if (clipEnd <= clipStart || clipEnd <= dayStart) {
        return null
    }

    const startMinutes = (clipStart.getTime() - dayStart.getTime()) / 60000
    const endMinutes = (clipEnd.getTime() - dayStart.getTime()) / 60000

    return { startMinutes, endMinutes }
}

/**
 * 計算一欄中重疊事件的分欄佈局，沿用 DayView 的貪婪欄位分配。
 */
function computeColumnLayouts(eventList, dayBounds) {
    if (!eventList.length) {
        return []
    }

    const { start: dayStart, end: dayEnd } = dayBounds

    const segments = []
    for (const event of eventList) {
        const clip = clipEventToDay(event, dayStart, dayEnd)
        if (!clip) continue
        segments.push({ event, ...clip })
    }

    if (!segments.length) {
        return []
    }

    segments.sort((a, b) =>
        a.startMinutes - b.startMinutes ||
        (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes),
    )

    const columns = []
    const placements = segments.map(segment => {
        let columnIndex = columns.findIndex(
            endMinutes => segment.startMinutes >= endMinutes,
        )

        if (columnIndex === -1) {
            columnIndex = columns.length
            columns.push(segment.endMinutes)
        } else {
            columns[columnIndex] = segment.endMinutes
        }

        return { segment, columnIndex }
    })

    placements.forEach(placement => {
        const { segment, columnIndex } = placement
        const overlappingColumns = new Set([columnIndex])

        placements.forEach(other => {
            if (other === placement) return
            const overlaps =
                segment.startMinutes < other.segment.endMinutes &&
                other.segment.startMinutes < segment.endMinutes

            if (overlaps) {
                overlappingColumns.add(other.columnIndex)
            }
        })

        placement.totalColumns = overlappingColumns.size
    })

    const EVENT_GAP_RATIO = 0.008

    return placements.map(placement => {
        const { segment, columnIndex, totalColumns } = placement
        const columnWidth = 1 / totalColumns
        const left = columnIndex * columnWidth + EVENT_GAP_RATIO / 2
        const width = columnWidth - EVENT_GAP_RATIO

        return {
            event: segment.event,
            startMinutes: segment.startMinutes,
            endMinutes: segment.endMinutes,
            left: `${left * 100}%`,
            width: `${width * 100}%`,
        }
    })
}

/**
 * 七欄資訊：本地星期日起算的 7 個日期，附帶星期標籤、是否為今日。
 * 每欄的 events 取自 eventList 中發生在該日的部分，並預先計算版面配置。
 */
const weekColumns = computed(() => {
    const weekStart = getWeekStart(props.selectedDate ?? new Date())
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0)
    const todayWeekStart = getWeekStart(todayMid)
    const showTodayHighlight = weekStart.getTime() === todayWeekStart.getTime()

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        const dayBounds = {
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0),
        }
        const layouts = computeColumnLayouts(props.eventList, dayBounds)
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        return {
            date,
            dayNumber: date.getDate(),
            weekdayName: weekdayNames[date.getDay()],
            isToday: showTodayHighlight && dateKey === todayKey,
            layouts,
        }
    })
})

const showDrawer = ref(false)
const drawerTitle = ref("")
const drawerMode = ref("")
const eventData = ref(null)

function createEvent(date) {
    const baseDate = date ?? props.selectedDate ?? new Date()
    const start = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        new Date().getHours(),
        0,
        0,
        0,
    )
    const end = new Date(start)
    end.setHours(start.getHours() + 1)
    eventData.value = {
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
    }
    drawerTitle.value = "創建事件"
    drawerMode.value = 'CREATE'
    showDrawer.value = true
}

function editEvent(event) {
    eventData.value = event
    drawerTitle.value = "編輯事件"
    drawerMode.value = 'EDIT'
    showDrawer.value = true
}
</script>

<style scoped>
.week-view {
    /* 為了讓頁首七欄與下方七欄左邊界精準對齊，讓頁首跟內欄共用同一個 80px 時間軸寬度（含 1px 右邊框）。 */
    --week-view-time-axis-width: 80px;
    --week-view-time-axis-border: 1px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

.week-view__head {
    display: flex;
    flex-shrink: 0;
    background-color: var(--White);
    border-bottom: 1px solid rgba(60, 60, 60, 0.12);
}

.week-view__time-axis-head {
    width: calc(var(--week-view-time-axis-width) + var(--week-view-time-axis-border));
    flex-shrink: 0;
    box-sizing: border-box;
}

.week-view__weekdays {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    min-width: 0;
}

.week-view__weekday {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
    cursor: pointer;
    border-left: 1px solid rgba(60, 60, 60, 0.08);
    box-sizing: border-box;
    transition: background-color 0.15s ease;
}

.week-view__weekday:first-child {
    border-left: none;
}

.week-view__weekday:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.week-view__weekday-name {
    font-size: 12px;
    color: rgba(60, 60, 60, 0.66);
}

.week-view__weekday-date {
    font-size: 16px;
    font-weight: 500;
    margin-top: 2px;
    color: rgba(60, 60, 60, 0.86);
}

.week-view__weekday.is-today {
    background-color: rgba(64, 158, 255, 0.08);
    border-radius: 4px;
}

.week-view__weekday.is-today .week-view__weekday-name,
.week-view__weekday.is-today .week-view__weekday-date {
    color: var(--Primary);
    font-weight: 600;
}

.week-view__body {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.week-view__body::-webkit-scrollbar {
    width: 6px;
}

.week-view__body::-webkit-scrollbar-track {
    background: transparent;
}

.week-view__body::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.week-view__time-axis {
    width: var(--week-view-time-axis-width);
    flex-shrink: 0;
    border-right: var(--week-view-time-axis-border) solid rgba(60, 60, 60, 0.12);
    box-sizing: border-box;
}

.week-view__time-label {
    height: 60px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding-right: 8px;
    font-size: 12px;
    color: rgba(60, 60, 60, 0.66);
    line-height: 1;
    padding-top: 4px;
    box-sizing: border-box;
}

.week-view__columns {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    min-width: 0;
}

.week-view__column {
    position: relative;
    border-left: 1px solid rgba(60, 60, 60, 0.08);
    box-sizing: border-box;
}

.week-view__column:first-child {
    border-left: none;
}

.week-view__grid-line {
    height: 60px;
    border-top: 1px solid rgba(60, 60, 60, 0.12);
    box-sizing: border-box;
}
</style>
