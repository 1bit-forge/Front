<template>

    <div class="calendar-view">

        <div class="calendar-header">
            <span class="calendar-header__label">{{ headerLabel }}</span>
            <el-button-group>
                <el-button size="small" @click="selectDate('prev-month')">
                    上個月
                </el-button>
                <el-button size="small" @click="selectDate('today')">
                    今天
                </el-button>
                <el-button size="small" @click="selectDate('next-month')">
                    下個月
                </el-button>
            </el-button-group>
        </div>

        <calendar ref="calendarRef" v-model="value" />

    </div>

</template>

<script setup>

import Calendar from '@/components/Calendar.vue'
import { computed, ref } from 'vue'


const value = ref(new Date())
const viewMode = ref('month')
const calendarRef = ref()

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
    padding: 12px 0;
}

.calendar-header__label {
    font-size: 16px;
    font-weight: 500;
}

.calendar-view :deep(.calendar) {
    flex: 1;
    min-height: 0;
}
</style>
