<template>
    <div class="drawer-container">
        <el-form :model="form" label-width="auto">
            <el-form-item label="Event name">
                <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="Description">
                <el-input v-model="form.description" type="textarea" />
            </el-form-item>
            <el-form-item label="重要性">
                <el-input-number v-model="form.priority" :min="1" :max="5" />
            </el-form-item>
            <el-form-item label="狀態">
                <el-select v-model="form.status" placeholder="please select your zone" style="max-width: 300px">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="Time Range" v-show="form.status == 'todo'">
                <el-date-picker v-if="calendarType == 'MONTH'" v-model="form.timeRange" type="datetimerange"
                    start-placeholder="Start date" end-placeholder="End date" format="YYYY-MM-DD HH:mm"
                    date-format="YYYY/MM/DD ddd" time-format="A hh:mm" />
                <div v-if="calendarType == 'DAY'" class="demo-time-range">
                    <el-time-picker v-model="form.timeRange" is-range range-separator="To"
                        start-placeholder="Start time" end-placeholder="End time" />
                </div>
            </el-form-item>
            <el-form-item label="重複" v-show="form.status == 'todo'">
                <el-select v-model="form.loop" placeholder="please select your zone" style="max-width: 300px">
                    <el-option v-for="item in loopOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="啟用自動重排" v-show="form.status == 'todo'">
                <el-checkbox v-model="form.autoReschedule" />
            </el-form-item>
            <el-form-item label="事件持續時間" v-show="form.status == 'unscheduled'">
                <el-input-number v-model="form.estimatedMinutes" :min="0" :step="30" />
            </el-form-item>
        </el-form>
        <div class="footer">
            <el-button @click="cancelClick">cancel</el-button>
            <Btn v-if="mode == 'EDIT'" fitContent color="tertiary" @click="deleteEvent"><el-icon>
                    <Delete />
                </el-icon></Btn>
            <el-button type="primary" @click="confirmClick">confirm</el-button>
        </div>
    </div>

</template>

<script setup>
import { reactive, watch } from 'vue';
import Btn from './Btn.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as eventApi from '@/api/event';

const props = defineProps({
    eventData: Object,
    mode: {
        type: String,
        default: "CREATE"
    },
    calendarType: String
})

const form = reactive({
    eventId: '',
    title: '',
    description: '',
    timeRange: null,
    loop: '',
    autoReschedule: true,
    status: '',
    estimatedMinutes: 30,
    earliestStart: '',
    latestEnd: '',
    priority: 3
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

const statusOptions = [
    {
        value: 'todo',
        label: '待完成',
    },
    {
        value: 'unscheduled',
        label: '待安排',
    },
    {
        value: 'done',
        label: '已完成',
    }
]

function syncFormFromEvent(data) {
    if (!data) {
        Object.assign(form, {
            eventId: '',
            title: '',
            description: '',
            timeRange: null,
            loop: '不重複',
            autoReschedule: true,
            status: 'todo',
            estimatedMinutes: 30,
            earliestStart: '',
            latestEnd: '',
            priority: 3,
            startsAt: '',
            endsAt: '',
        })
        return
    }
    form.eventId = data.eventId ?? ''
    form.title = data.title ?? ''
    form.description = data.description ?? ''
    form.loop = data.loop ?? '不重複'
    form.autoReschedule = data.autoReschedule ?? true
    form.timeRange = data.startsAt && data.endsAt
        ? [new Date(data.startsAt), new Date(data.endsAt)]
        : null
    form.startsAt = data.startsAt ? data.startsAt.slice(11, 16) : ''
    form.endsAt = data.endsAt ? data.endsAt.slice(11, 16) : ''
    form.status = data.status ?? 'todo'
    form.estimatedMinutes = data.estimatedMinutes ?? 30
    form.earliestStart = data.earliestStart ?? ''
    form.latestEnd = data.latestEnd ?? ''
    form.priority = data.priority ?? 3
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
        .then(async () => {
            const params = {
                eventId: form.eventId
            }
            const res = await eventApi.deleteEvent(params)
            console.log(res)
            emit('loadData')
            emit('update:drawer', false)
            ElMessage({
                type: 'warning',
                message: '成功刪除事件',
            })
        })
    // .catch(() => {
    //     ElMessage({
    //         type: 'info',
    //         message: 'Delete canceled',
    //     })
    // })
}

const emit = defineEmits(['update:drawer', 'loadData'])

function cancelClick() {
    emit('update:drawer', false)
}

async function confirmClick() {
    if (props.mode === 'CREATE') {
        await createEvent()
    } else if (props.mode === 'EDIT') {
        await editEvent()
    }
    emit('loadData')
    emit('update:drawer', false)
}

async function createEvent() {
    const startsAt = form.timeRange[0]
    const endsAt = form.timeRange[1]
    const params = {
        title: form.title,
        description: form.description,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        priority: form.priority,
        status: form.status
    }
    const res = await eventApi.createEvent(params)
    if (res.message == 'Success') {
        ElMessage({
            type: 'success',
            message: '成功創建事件',
        })
    }
}

async function editEvent() {
    const startsAt = form.timeRange[0]
    const endsAt = form.timeRange[1]
    const params = {
        eventId: form.eventId,
        title: form.title,
        description: form.description,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        priority: form.priority,
        status: form.status
    }
    const res = await eventApi.editEvent(params)
    if (res.message == 'Success') {
        ElMessage({
            type: 'success',
            message: '成功更新事件',
        })
    }
}
</script>

<style scoped>
.drawer-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.demo-time-range {
    width: 100%;
    display: flex;
    justify-content: space-between !important;
}

.footer {
    display: flex;
    justify-content: end;
    gap: 0.5vw;
}
</style>