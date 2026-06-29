<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="Event name">
            <el-input v-model="form.eventName" />
        </el-form-item>
        <el-form-item label="Description">
            <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="Time Range">
            <el-date-picker v-model="timeRange" type="datetimerange" start-placeholder="Start date"
                end-placeholder="End date" format="YYYY-MM-DD HH:mm:ss" date-format="YYYY/MM/DD ddd"
                time-format="A hh:mm:ss" />
        </el-form-item>
        <el-form-item label="重複">
            <el-select v-model="form.loop" placeholder="please select your zone" style="max-width: 300px">
                <el-option v-for="item in loopOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </el-form-item>
        <el-form-item label="啟用自動重排">
            <el-checkbox v-model="form.autoReschedule" />
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
    eventName: '',
    description: '',
    timeRange: '',
    loop: '',
    autoReschedule: true
})

const loopOptions = [
    {
        value: '不重複',
        label: 'none',
    },
    {
        value: '每天',
        label: 'everyDay',
    },
    {
        value: '每周',
        label: 'everyWeek',
    },
    {
        value: '每月',
        label: 'everyMonth',
    },
    {
        value: '每年',
        label: 'everyYear',
    },
]
</script>

<style scoped></style>