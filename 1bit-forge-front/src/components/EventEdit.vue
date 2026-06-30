<template>
    <div>
        <el-form :model="form" label-width="auto">
            <el-form-item label="Event name">
                <el-input v-model="form.eventName" />
            </el-form-item>
            <el-form-item label="Description">
                <el-input v-model="form.description" type="textarea" />
            </el-form-item>
            <el-form-item label="Time Range">
                <el-date-picker v-model="form.timeRange" type="datetimerange" start-placeholder="Start date"
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
        <div class="delete-btn">
            <Btn v-if="mode == 'EDIT'" fitContent color="tertiary" @click="deleteEvent"><el-icon>
                    <Delete />
                </el-icon></Btn>
        </div>

    </div>

</template>

<script setup>
import { reactive, watch } from 'vue';
import Btn from './Btn.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps({
    eventData: Object,
    mode: {
        type: String,
        default: "DETAIL"
    }
})

const form = reactive({
    eventName: '',
    description: '',
    timeRange: null,
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

function syncFormFromEvent(data) {
    if (!data) {
        form.eventName = ''
        form.description = ''
        form.loop = ''
        form.autoReschedule = true
        form.timeRange = null
        return
    }
    form.eventName = data.eventName ?? ''
    form.description = data.description ?? ''
    form.loop = data.loop ?? ''
    form.autoReschedule = data.autoReschedule ?? true
    form.timeRange = data.startTime && data.endTime
        ? [new Date(data.startTime), new Date(data.endTime)]
        : null
}

watch(() => props.eventData, syncFormFromEvent, { immediate: true })

function deleteEvent() {
    ElMessageBox.confirm(
        '是否確認刪除此事件?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
            zIndex: 3000,
        }
    )
        .then(() => {
            ElMessage({
                type: 'warning',
                message: 'Delete completed',
            })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: 'Delete canceled',
            })
        })
}
</script>

<style scoped>
.delete-btn {

    display: flex;
    justify-content: end;
}
</style>