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
            }">
                <span class="calendar__day">{{ cell.day }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Date,
        default: () => new Date(),
    },
})

const emit = defineEmits(['update:modelValue'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

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
    padding: 8px;
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
}
</style>
