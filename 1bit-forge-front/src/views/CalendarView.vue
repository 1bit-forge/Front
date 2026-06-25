<template>

    <div class="calendar-view">

        <el-calendar v-model="value" />

    </div>

</template>

<script setup>

import { ref } from 'vue'


const value = ref(new Date())

</script>

<style scoped>
.calendar-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.calendar-view :deep(.el-calendar) {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.calendar-view :deep(.el-calendar__body) {
    flex: 1;
    min-height: 0;
}

.calendar-view :deep(.el-calendar-table) {
    height: 100%;
    table-layout: fixed;
}

.calendar-view :deep(.el-calendar-table tbody tr) {
    height: 16.666%;
}

.calendar-view :deep(.el-calendar-day) {
    height: 100%;
}
</style>
