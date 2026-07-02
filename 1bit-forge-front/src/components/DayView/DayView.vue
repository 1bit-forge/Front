<template>
    <div class="day-view">
        <!-- 左側時間軸：固定寬度 80px，每小時一格，每格高度為 60px -->
        <div class="day-view__time-axis">
            <div v-for="hour in hours" :key="hour" class="day-view__time-label">
                {{ hour }}
            </div>
        </div>

        <!-- 右側內容容器：position: relative，作為事件與格線的定位依據 -->
        <div class="day-view__events-container">
            <!-- 24 條橫向背景格線，每條高度 60px -->
            <div v-for="hour in hours" :key="`grid-${hour}`" class="day-view__grid-line"></div>

            <!-- 事件區塊：absolute 定位，top/height 依時間換算 -->
            <DayViewEvent
                v-for="event in eventList"
                :key="event.eventId"
                :event="event"
                :top="getEventTop(event.startTime)"
                :height="getEventHeight(event.startTime, event.endTime)"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import DayViewEvent from './DayViewEvent.vue'

const props = defineProps({
    eventList: {
        type: Array,
        default: () => [],
    },
})

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
 * 將 HH:mm 字串解析為「距離 00:00 的總分鐘數」。
 * 例如：09:30 -> 570、12:00 -> 720
 */
function parseTimeToMinutes(timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number)
    return hour * 60 + minute
}

/**
 * 事件區塊的 top 定位。
 * 直接以開始時間的總分鐘數 * 1px 作為距離頂部的偏移。
 */
function getEventTop(startTime) {
    return parseTimeToMinutes(startTime) * 1
}

/**
 * 事件區塊的高度。
 * 以結束時間的總分鐘數減去開始時間的總分鐘數，
 * 再乘上 1px / 分鐘的換算比例。
 */
function getEventHeight(startTime, endTime) {
    return (parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime)) * 1
}

/**
 * Mock Data：
 * 用 HH:mm 格式的事件時間測試時間軸定位邏輯。
 */
const eventList = ref([
    {
        eventId: 'mock-1',
        eventName: 'test',
        startTime: '12:30',
        endTime: '13:30',
    },
    {
        eventId: 'mock-2',
        eventName: '下午部門例會',
        startTime: '15:00',
        endTime: '18:30',
    },
])
</script>

<style scoped>
.day-view {
    display: flex;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
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
