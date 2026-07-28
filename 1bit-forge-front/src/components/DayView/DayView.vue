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

            <!-- 事件區塊：absolute 定位，top/height/left/width 依時間與分欄計算 -->
            <DayViewEvent
                v-for="layout in eventLayouts"
                :key="layout.event.eventId"
                :event="layout.event"
                :top="getEventTop(layout.event.startsAt)"
                :height="getEventHeight(layout.event.startsAt, layout.event.endsAt)"
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
 * 將事件時間字串解析為「距離 00:00 的總分鐘數」。
 * 使用 `new Date()` 讓瀏覽器依本地時區換算，避免直接 slice ISO 字串而忽略時區偏移。
 * 例如：'2026-06-26T12:30:00+08:00' 與 '2026-06-26T04:30:00Z' 在本地時區下皆會得到 12:30 -> 750。
 */
function parseTimeToMinutes(timeStr) {
    const date = new Date(timeStr)
    if (Number.isNaN(date.getTime())) {
        return 0
    }
    return date.getHours() * 60 + date.getMinutes()
}

/**
 * 事件區塊的 top 定位。
 * 直接以開始時間的總分鐘數 * 1px 作為距離頂部的偏移。
 */
function getEventTop(startsAt) {
    return parseTimeToMinutes(startsAt) * 1
}

/**
 * 事件區塊的高度。
 * 以結束時間的總分鐘數減去開始時間的總分鐘數，
 * 再乘上 1px / 分鐘的換算比例。
 */
function getEventHeight(startsAt, endsAt) {
    return (parseTimeToMinutes(endsAt) - parseTimeToMinutes(startsAt)) * 1
}

/**
 * 計算重疊事件的分欄佈局。
 *
 * 規則：
 * 1. 依 startsAt 排序。
 * 2. 逐事件放進第一個「不會與該欄最後一個事件重疊」的欄位。
 * 3. 若所有現有欄位都重疊，則開新欄。
 * 4. 每個事件最終會得到：
 *    - columnIndex：它在所屬群組中的第幾欄
 *    - totalColumns：與它同時段重疊的事件總共有幾欄
 *
 * 最後將 columnIndex / totalColumns 轉為 left / width 百分比傳給 DayViewEvent。
 */
function computeEventLayout(eventList) {
    if (!eventList.length) {
        return []
    }

    const events = eventList.map(event => ({
        ...event,
        startMinutes: parseTimeToMinutes(event.startsAt),
        endMinutes: parseTimeToMinutes(event.endsAt),
    }))

    // 依開始時間排序，同時段則以較長的優先處理，減少不必要的多欄
    events.sort((a, b) =>
        a.startMinutes - b.startMinutes ||
        (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes),
    )

    const columns = []
    const placements = events.map(event => {
        let columnIndex = columns.findIndex(
            endMinutes => event.startMinutes >= endMinutes,
        )

        if (columnIndex === -1) {
            columnIndex = columns.length
            columns.push(event.endMinutes)
        } else {
            columns[columnIndex] = event.endMinutes
        }

        return {
            event,
            columnIndex,
        }
    })

    // 計算每個事件實際應用的 totalColumns
    placements.forEach(placement => {
        const { event, columnIndex } = placement
        const overlappingColumns = new Set([columnIndex])

        placements.forEach(other => {
            if (other === placement) return
            const overlaps =
                event.startMinutes < other.event.endMinutes &&
                other.event.startMinutes < event.endMinutes

            if (overlaps) {
                overlappingColumns.add(other.columnIndex)
            }
        })

        placement.totalColumns = overlappingColumns.size
    })

    const EVENT_GAP_RATIO = 0.008

    return placements.map(placement => {
        const { event, columnIndex, totalColumns } = placement
        const columnWidth = 1 / totalColumns
        const left = columnIndex * columnWidth + EVENT_GAP_RATIO / 2
        const width = columnWidth - EVENT_GAP_RATIO

        return {
            event,
            left: `${left * 100}%`,
            width: `${width * 100}%`,
        }
    })
}

/**
 * 由父層傳入的真實事件列表，透過 computeEventLayout 計算版面配置。
 */
const eventLayouts = computed(() => computeEventLayout(props.eventList))

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
    width: 80px;
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
