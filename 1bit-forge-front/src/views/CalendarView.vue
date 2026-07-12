<template>

    <div class="calendar-view">

        <div class="calendar-header">
            <div>
                <span class="calendar-header__label">{{ headerLabel }}</span>
            </div>
            <div>
                <el-select v-model="calendarMode" placeholder="Select" style="width: 100px; margin-right: 2vw;">
                    <el-option v-for="item in calendarModeOption" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-button-group>
                    <el-button @click="selectDate('prev-month')">
                        上個月
                    </el-button>
                    <el-button @click="selectDate('today')">
                        今天
                    </el-button>
                    <el-button @click="selectDate('next-month')">
                        下個月
                    </el-button>
                </el-button-group>
            </div>
        </div>
        <calendar v-if="calendarMode === 'month'" ref="calendarRef" v-model="value" :eventList="eventList" @loadData="loadData" />
        <DayView v-else-if="calendarMode === 'day'" :eventList="dayViewMockData" @createEvent="loadData"/>
    </div>

</template>

<script setup>

import Calendar from '@/components/Calendar/Calendar.vue'
import DayView from '@/components/DayView/DayView.vue'
import { computed, reactive, ref, watch } from 'vue'
import * as eventApi from '@/api/event'
import { ApiError } from '@/api/client'


const value = ref(new Date())
const viewMode = ref('month')
const calendarRef = ref()
const calendarMode = ref('month')
const eventList = ref([])

const calendarModeOption = [
    {
        value: 'month',
        label: '月',
    },
    {
        value: 'day',
        label: '日',
    },
]

const mockDataList = reactive([
    {
        "eventId": "a2b9e45127b9e4a321cc443456789abc",
        "title": "GYM",
        "description": "go gym with Isaac",
        "startsAt": "2026-06-26T08:30:00+08:00",
        "endsAt": "2026-06-26T10:30:00+08:00"
    },
    {
        "eventId": "a2b9e434b9e4a321cc45451276789abc",
        "title": "Lunch",
        "description": "lunch with family",
        "startsAt": "2026-06-26T12:30:00+08:00",
        "endsAt": "2026-06-26T13:30:00+08:00"
    },
    {
        "eventId": "a2b9e434b9e4a321cc45451276789abc",
        "title": "Lunch",
        "description": "lunch with family",
        "startsAt": "2026-06-26T12:30:00+08:00",
        "endsAt": "2026-06-26T13:30:00+08:00"
    },
    {
        "eventId": "a2b9e434b9e4a321cc45451276789abc",
        "title": "Lunch",
        "description": "lunch with family",
        "startsAt": "2026-06-26T12:30:00+08:00",
        "endsAt": "2026-06-26T13:30:00+08:00"
    },
    {
        "eventId": "b3c9e56238cae5b432dd55456789def",
        "title": "Do Project",
        "description": "Make Frontend Code",
        "startsAt": "2026-06-12T09:00:00+08:00",
        "endsAt": "2026-06-15T11:00:00+08:00"
    },
    {
        "eventId": "c4d0f67349dbe6c543ee6656789ghi",
        "title": "GYM",
        "description": "go gym with Isaac",
        "startsAt": "2026-06-19T15:30:00+08:00",
        "endsAt": "2026-06-19T17:30:00+08:00"
    }
])

const dayViewMockData = reactive([])

const headerLabel = computed(() => {
    if (viewMode.value === 'day') {
        return value.value.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return value.value.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
    })
})

const selectDate = (type) => {
    calendarRef.value?.selectDate(type)
}

const startsAt = computed(() => {
    const date = new Date(value.value.getFullYear(), value.value.getMonth(), 1)
    return date.toISOString()
})

const endsAt = computed(() => {
    const date = new Date(value.value.getFullYear(), value.value.getMonth() + 1, 1)
    return date.toISOString()
})

async function loadData(){
    try {
        const params = {
            startsAt: startsAt.value,
            endsAt: endsAt.value,
        }
        const res = await eventApi.getEventList(params)
        console.log("load Event Data: ", res)
        eventList.value = res.data
    } catch (err) {
        if (err instanceof ApiError && err.code === 401) return
        console.error('loadData failed:', err)
    }
}

// 監聽 value 變化，重新載入資料
watch(value, () => {
    loadData()
})

// 監聽 calendarMode 變化，重新載入資料
watch(calendarMode, () => {
    loadData()
})

// 初始載入
loadData()

</script>

<style scoped>
.calendar-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px;
    border-radius: 8px;
    background-color: var(--White);
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1vh 0;
}

.calendar-header__label {
    font-size: clamp(18px, 4vw, 28px);
    font-weight: 500;
}

.calendar-view :deep(.calendar) {
    flex: 1;
    min-height: 0;
}
</style>
