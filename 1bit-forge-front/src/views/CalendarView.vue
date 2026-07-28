<template>

    <div class="calendar-view">

        <div class="calendar-header">
            <div>
                <span class="calendar-header__label">{{ headerLabel }}</span>
            </div>
            <div class="function-btn-group">
                <el-select v-model="calendarMode" placeholder="Select" style="width: 100px; margin-right: 2vw;">
                    <el-option v-for="item in calendarModeOption" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-button-group style="margin-right: 2vw;">
                    <el-button @click="selectDate('prev')">
                        {{ calendarMode === 'day' ? '昨天' : '上個月' }}
                    </el-button>
                    <el-button @click="selectDate('today')">
                        今天
                    </el-button>
                    <el-button @click="selectDate('next')">
                        {{ calendarMode === 'day' ? '明天' : '下個月' }}
                    </el-button>
                </el-button-group>
                <el-button @click="showUnScheduledList = !showUnScheduledList">待安排事件</el-button>
            </div>
        </div>
        <calendar v-if="calendarMode === 'month'" ref="calendarRef" v-model="value" :eventList="eventList" @loadData="loadData" />
        <DayView v-else-if="calendarMode === 'day'" :eventList="dayEventList" :selectedDate="value"
            @createEvent="loadData" />
        <!-- <button
            class="drawer-toggle"
            :class="{ 'drawer-toggle--shifted': showUnScheduledList }"
            @click="showUnScheduledList = !showUnScheduledList"
            :aria-label="showUnScheduledList ? '關抽屜' : '開抽屜'"
        >
            <span v-if="!showUnScheduledList">◂</span>
            <span v-else>▸</span>
        </button> -->
        <MyDrawer v-model:drawer="showUnScheduledList" title="待安排事件" :maxWidth="`400px`" :minWidth="`200px`">
            <UnScheduledList :event-list="mockDataList" @loadData="loadUnScheduledData" />
        </MyDrawer>
    </div>

</template>

<script setup>

import Calendar from '@/components/Calendar/Calendar.vue'
import DayView from '@/components/DayView/DayView.vue'
import { computed, reactive, ref, watch } from 'vue'
import * as eventApi from '@/api/event'
import { ApiError } from '@/api/client'
import MyDrawer from '@/components/MyDrawer.vue'
import Btn from '@/components/Btn.vue'
import UnScheduledList from '@/components/UnScheduledList/UnScheduledList.vue'


const value = ref(new Date())
const calendarRef = ref()
const calendarMode = ref('month')
const eventList = ref([])
const showUnScheduledList = ref(false)

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

const dayEventList = ref([])

const headerLabel = computed(() => {
    if (calendarMode.value === 'day') {
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
    if (calendarMode.value === 'day') {
        const next = new Date(value.value)
        if (type === 'prev') {
            next.setDate(next.getDate() - 1)
        } else if (type === 'next') {
            next.setDate(next.getDate() + 1)
        } else if (type === 'today') {
            value.value = new Date()
            return
        }
        value.value = next
        return
    }
    calendarRef.value?.selectDate(`${type}-month`)
}

const startsAt = computed(() => {
    const date = new Date(value.value.getFullYear(), value.value.getMonth(), 1)
    return date.toISOString()
})

const endsAt = computed(() => {
    const date = new Date(value.value.getFullYear(), value.value.getMonth() + 1, 1)
    return date.toISOString()
})

const dayStartsAt = computed(() => {
    const date = new Date(value.value.getFullYear(), value.value.getMonth(), value.value.getDate(), 0, 0, 0, 0)
    return date.toISOString()
})

const dayEndsAt = computed(() => {
    const date = new Date(value.value.getFullYear(), value.value.getMonth(), value.value.getDate(), 23, 59, 59, 999)
    return date.toISOString()
})

async function loadData(){
    try {
        const params = calendarMode.value === 'day'
            ? { startsAt: dayStartsAt.value, endsAt: dayEndsAt.value }
            : { startsAt: startsAt.value, endsAt: endsAt.value }
        const res = await eventApi.getEventList(params)
        console.log("load Event Data: ", res)
        if (calendarMode.value === 'day') {
            dayEventList.value = res.data
        } else {
            eventList.value = res.data
        }
    } catch (err) {
        if (err instanceof ApiError && err.code === 401) return
        console.error('loadData failed:', err)
    }
}

function loadUnScheduledData() {
    mockDataList.splice(0, mockDataList.length, ...mockDataList.slice())
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

.function-btn-group{
    display: flex;
    
}

.calendar-view :deep(.calendar) {
    flex: 1;
    min-height: 0;
}

.drawer-toggle {
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 9999;
    width: 28px;
    height: 56px;
    border: none;
    border-radius: 6px 0 0 6px;
    background: var(--White);
    box-shadow: -2px 0 6px rgba(0, 0, 0, 0.12);
    color: #333;
    font-size: 16px;
    line-height: 56px;
    cursor: pointer;
    transition: right 0.25s ease, background 0.15s ease;
}

.drawer-toggle:hover {
    background: #f3f3f3;
}

.drawer-toggle--shifted {
    right: 500px;
}
</style>
