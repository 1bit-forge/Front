<template>
    <div class="day-view">
        <!-- 左側時間軸：固定寬度 80px，每小時一格，每格高度為 60px -->
        <div class="day-view__time-axis">
            <div v-for="hour in hours" :key="hour" class="day-view__time-label">
                {{ hour }}
            </div>
        </div>

        <!-- 右側內容容器：position: relative，作為事件與格線的定位依據 -->
        <div class="day-view__events-container" @click="createEvent">
            <!-- 24 條橫向背景格線，每條高度 60px -->
            <div v-for="hour in hours" :key="`grid-${hour}`" class="day-view__grid-line"></div>

            <!-- 事件區塊：absolute 定位，top/height 依當日裁切後的分鐘計算，left/width 依重疊分欄計算 -->
            <DayViewEvent
                v-for="layout in eventLayouts"
                :key="layout.event.eventId"
                :event="layout.event"
                :top="layout.startMinutes"
                :height="layout.endMinutes - layout.startMinutes"
                :left="layout.left"
                :width="layout.width"
                @click.stop="editEvent(layout.event)"
            />
        </div>

        <MyDrawer v-model:drawer="showDrawer" :title="drawerTitle">
            <EventEdit :event-data="eventData" :mode="drawerMode" calendarType="DAY"
                @update:drawer="showDrawer = false"
                @createEvent="emit('createEvent')"/>
        </MyDrawer>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import DayViewEvent from './DayViewEvent.vue'
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
 * 日曆時間軸高度常數：
 * 1 小時 = 60px，換句話說「1 分鐘 = 1px」。
 * 因此 top 與 height 都可以直接用分鐘數當作像素值計算。
 */
const HOUR_HEIGHT = 60

/**
 * 產生 00:00 ~ 23:00 的小時標籤陣列。
 */
const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`,
)

/**
 * 將 ISO 時間字串解析為 Date；無效則回傳 null。
 */
function parseEventDate(timeStr) {
    const date = new Date(timeStr)
    return Number.isNaN(date.getTime()) ? null : date
}

/**
 * 計算當日區間 [00:00, 次日 00:00) 的 Date。
 * 使用 selectedDate 的本地年月日，避免 toISOString / UTC slice 造成的時區偏移。
 */
function getDayBounds(selectedDate) {
    const base = selectedDate ?? new Date()
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0)
    const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1, 0, 0, 0, 0)
    return { start, end }
}

/**
 * 計算事件與當日區間的交集，並轉成當日內的分鐘起訖 [0, 1440]。
 *
 * 規則：
 * 1. 將事件時間轉成 Date 物件，若任一無效則略過。
 * 2. 以半開區間 [eventStart, eventEnd) 與 [dayStart, dayEnd) 取交集。
 * 3. 交集轉為距離當日 00:00 的分鐘數，供版面計算使用。
 * 4. 若結束時間恰為當日 00:00，視為前一日的終點，本日不渲染（避免 0px 殘影）。
 *
 * 範例：2026-07-29 16:00 ~ 2026-07-31 10:00
 *   - 7 月 29 日：960 ~ 1440（16:00 ~ 24:00）
 *   - 7 月 30 日：0    ~ 1440（全天）
 *   - 7 月 31 日：0    ~ 600 （00:00 ~ 10:00）
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

    return {
        startMinutes,
        endMinutes,
    }
}

/**
 * 事件區塊的 top 定位（以當日裁切後的分鐘數作為像素偏移）。
 */
function getEventTop(startMinutes) {
    return startMinutes * 1
}

/**
 * 事件區塊的高度（以當日裁切後的分鐘數差作為像素）。
 */
function getEventHeight(startMinutes, endMinutes) {
    return (endMinutes - startMinutes) * 1
}

/**
 * 計算重疊事件的分欄佈局（以當日裁切後的分鐘數判斷重疊）。
 *
 * 規則：
 * 1. 對每筆事件以 clipEventToDay 取得當日區段；無交集則略過。
 * 2. 依 startMinutes 排序；同時段則以較長的優先處理，減少不必要的多欄。
 * 3. 逐事件放進第一個「不會與該欄最後一個事件重疊」的欄位。
 * 4. 若所有現有欄位都重疊，則開新欄。
 * 5. 每個事件最終會得到：
 *    - columnIndex：它在所屬群組中的第幾欄
 *    - totalColumns：與它同時段重疊的事件總共有幾欄
 *
 * 最後將 columnIndex / totalColumns 轉為 left / width 百分比傳給 DayViewEvent，
 * 並回傳裁切後的 startMinutes / endMinutes 供 top / height 計算。
 */
function computeEventLayout(eventList, dayBounds) {
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

        return {
            segment,
            columnIndex,
        }
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
 * 由父層傳入的真實事件列表，透過 computeEventLayout 計算版面配置。
 * 依目前 selectedDate 計算當日區間，並將跨日事件裁切到當日顯示。
 */
const eventLayouts = computed(() =>
    computeEventLayout(props.eventList, getDayBounds(props.selectedDate)),
)

const showDrawer = ref(false)
const drawerTitle = ref("")
const drawerMode = ref("")
const eventData = ref(null)

function createEvent(){
    const baseDate = props.selectedDate ?? new Date()
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
    drawerTitle.value  ="創建事件"
    drawerMode.value = 'CREATE'
    showDrawer.value = true
}

function editEvent(event){
    eventData.value = event
    drawerTitle.value  ="編輯事件"
    drawerMode.value = 'EDIT'
    showDrawer.value = true
}

</script>

<style scoped>
.day-view {
    display: flex;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.day-view::-webkit-scrollbar {
    width: 6px;
}

.day-view::-webkit-scrollbar-track {
    background: transparent;
}

.day-view::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.day-view__time-axis {
    width: 10vw;
    flex-shrink: 0;
    border-right: 1px solid rgba(60, 60, 60, 0.12);
}

.day-view__time-label {
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

.day-view__events-container {
    position: relative;
    flex: 1;
    min-height: 0;
}

.day-view__grid-line {
    height: 60px;
    border-top: 1px solid rgba(60, 60, 60, 0.12);
    box-sizing: border-box;
}
</style>
