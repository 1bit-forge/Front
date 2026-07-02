<template>
    <div
        class="day-view-event"
        :data-event-id="event.eventId"
        :style="eventStyle"
    >
        <p class="day-view-event__title">{{ event.eventName }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    event: {
        type: Object,
        required: true,
    },
    top: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    left: {
        type: String,
        default: '0%',
    },
    width: {
        type: String,
        default: '100%',
    },
})

/**
 * 統一由本元件處理事件區塊定位：
 * - position: absolute
 * - top / height 由父層傳入，已經按照「1 分鐘 = 1px」換算完成。
 * - left / width 由父層傳入百分比，用於重疊事件並排。
 *
 * 為避免極短事件無法操作，這裡額外加上最小高度保護。
 */
const MIN_EVENT_HEIGHT = 24

const eventStyle = computed(() => ({
    position: 'absolute',
    top: `${props.top}px`,
    height: `${Math.max(props.height, MIN_EVENT_HEIGHT)}px`,
    left: props.left,
    width: props.width,
}))
</script>

<style scoped>
.day-view-event {
    width: 95%;
    left: 4px;
    right: 4px;
    background-color: var(--Primary);
    color: var(--White);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 1.4;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
}

/* .day-view-event:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    z-index: 2;
} */

.day-view-event__title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
