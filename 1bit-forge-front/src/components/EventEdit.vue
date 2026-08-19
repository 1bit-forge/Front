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
            <el-form-item label="Time Range" >
                <template v-if="!isMobile">
                    <el-date-picker v-if="calendarType == 'MONTH'" v-model="form.timeRange" type="datetimerange"
                        start-placeholder="Start date" end-placeholder="End date" format="YYYY-MM-DD HH:mm"
                        date-format="YYYY/MM/DD ddd" time-format="A hh:mm" />
                    <div v-if="calendarType == 'DAY'" class="demo-time-range">
                        <el-time-picker v-model="form.timeRange" is-range range-separator="To"
                            start-placeholder="Start time" end-placeholder="End time" />
                    </div>
                </template>
                <template v-else>
                    <div v-if="calendarType == 'MONTH'" class="mobile-datetime-range">
                        <div class="mobile-time-range">
                            <MobileDatePickerField
                                :model-value="form.timeRange?.[0] ?? null"
                                @update:model-value="val => setTimeRangePart(0, val)"
                                placeholder="Start date"
                            />
                            <MobileTimePickerField
                                :model-value="form.timeRange?.[0] ?? null"
                                @update:model-value="val => setTimeRangePart(0, val)"
                                placeholder="Start time"
                            />
                        </div>
                        <span class="segment-range-separator">至</span>
                        <div class="mobile-time-range">
                            <MobileDatePickerField
                                :model-value="form.timeRange?.[1] ?? null"
                                @update:model-value="val => setTimeRangePart(1, val)"
                                placeholder="End date"
                            />
                            <MobileTimePickerField
                                :model-value="form.timeRange?.[1] ?? null"
                                @update:model-value="val => setTimeRangePart(1, val)"
                                placeholder="End time"
                            />
                        </div>
                    </div>
                    <div v-if="calendarType == 'DAY'" class="mobile-time-range">
                        <MobileTimePickerField
                            :model-value="form.timeRange?.[0] ?? null"
                            @update:model-value="val => setTimeRangePart(0, val)"
                            placeholder="Start time"
                        />
                        <span class="segment-range-separator">至</span>
                        <MobileTimePickerField
                            :model-value="form.timeRange?.[1] ?? null"
                            @update:model-value="val => setTimeRangePart(1, val)"
                            placeholder="End time"
                        />
                    </div>
                </template>
            </el-form-item>
            <div v-if="form.isRecurringView" class="recurring-banner">
                此為重複事件，編輯後將轉為單次事件。
            </div>
            <el-form-item label="重複" v-show="!form.isRecurringView">
                <el-select v-model="form.repeatFrequency" placeholder="please select your zone" style="max-width: 300px"
                    :disabled="form.isRecurringView">
                    <el-option v-for="item in repeatFrequencyOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="重複結束日期" v-show="form.repeatFrequency !== 'none' && !form.isRecurringView">
                <el-date-picker v-model="form.recurrenceEndDate" type="date" placeholder="請選擇重複結束日期" />
            </el-form-item>
            <el-form-item label="不參與自動重排" v-show="form.repeatFrequency === 'none' && !form.isRecurringView">
                <el-checkbox v-model="form.isFixed" />
            </el-form-item>
            <!-- <el-form-item label="事件持續時間" v-show="form.status == 'unscheduled'">
                <el-input-number v-model="form.estimatedMinutes" :min="0" :step="30" />
            </el-form-item> -->
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
import * as recurringEventApi from '@/api/recurringEvent';
import { useIsMobile } from '@/composables/useIsMobile';
import MobileDatePickerField from '@/components/common/MobileDatePickerField.vue';
import MobileTimePickerField from '@/components/common/MobileTimePickerField.vue';

const { isMobile } = useIsMobile();

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
    recurringEventId: '',
    isRecurringView: false,
    title: '',
    description: '',
    timeRange: null,
    repeatFrequency: '',
    isFixed: true,
    status: '',
    estimatedMinutes: 30,
    earliestStart: '',
    latestEnd: '',
    priority: 3
})

const repeatFrequencyOptions = [
    {
        value: 'none',
        label: '不重複',
    },
    {
        value: 'daily',
        label: '每天',
    },
    {
        value: 'weekly',
        label: '每周',
    },
    {
        value: 'biweekly',
        label: '每兩週',
    },
    {
        value: 'monthly',
        label: '每月',
    },
]

const statusOptions = [
    {
        value: 'todo',
        label: '待完成',
    },
    {
        value: 'scheduled',
        label: '已安排',
    },
    // {
    //     value: 'done',
    //     label: '已完成',
    // }
]

function setTimeRangePart(index, value) {
    const range = Array.isArray(form.timeRange) ? [...form.timeRange] : [null, null]
    range[index] = value
    form.timeRange = range
}

function pad2(n) {
    return String(n).padStart(2, '0')
}

function toDateString(date) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

function toLocalDateString(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function toTimeString(date) {
    return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`
}

function syncFormFromEvent(data) {
    if (!data) {
        Object.assign(form, {
            eventId: '',
            recurringEventId: '',
            isRecurringView: false,
            title: '',
            description: '',
            timeRange: null,
            repeatFrequency: 'none',
            isFixed: true,
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
    const isOccurrence = data.type === 'recurring_occurrence'
    form.eventId = isOccurrence ? '' : (data.eventId ?? '')
    form.recurringEventId = isOccurrence ? (data.recurringEventId ?? '') : ''
    form.isRecurringView = isOccurrence
    form.title = data.title ?? ''
    form.description = data.description ?? ''
    form.repeatFrequency = isOccurrence ? 'none' : (data.repeatFrequency ?? 'none')
    form.isFixed = data.isFixed ?? true
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

async function triggerDayReschedule(startsAt) {
    // 計算當地日期的 [00:00, 24:00) 作為重排範圍
    const dayStart = new Date(startsAt)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    try {
        await eventApi.reschedule({
            startTime: dayStart.toISOString(),
            endTime: dayEnd.toISOString(),
            apply: true,
        })
    } catch (err) {
        console.warn('當天重排失敗', err)
        // 不拋錯，避免影響主流程的 ElMessage 與 UI 關閉
    }
}

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
            if (form.isRecurringView) {
                if (!form.recurringEventId) {
                    ElMessage({
                        type: 'error',
                        message: '缺少重複事件識別，請從設定頁刪除',
                    })
                    return
                }
                const res = await recurringEventApi.deleteRecurringEvent({
                    recurringEventId: form.recurringEventId,
                })
                if (res.message == 'Success') {
                    ElMessage({
                        type: 'warning',
                        message: '成功刪除重複事件',
                    })
                }
                emit('loadData')
                emit('update:drawer', false)
                return
            }
            if (form.repeatFrequency !== 'none') {
                if (!form.recurringEventId) {
                    ElMessage({
                        type: 'error',
                        message: '缺少重複事件識別，請從設定頁刪除',
                    })
                    return
                }
                const res = await recurringEventApi.deleteRecurringEvent({
                    recurringEventId: form.recurringEventId,
                })
                if (res.message == 'Success') {
                    ElMessage({
                        type: 'warning',
                        message: '成功刪除重複事件',
                    })
                }
                emit('loadData')
                emit('update:drawer', false)
                return
            }
            const params = {
                eventId: form.eventId
            }
            const res = await eventApi.deleteEvent(params)
            if (res.message == 'Success') {
                ElMessage({
                    type: 'warning',
                    message: '成功刪除事件',
                })
                // 使用原始事件的 startsAt 計算當天重排範圍
                const origStart = props.eventData?.startsAt
                if (origStart) {
                    await triggerDayReschedule(new Date(origStart))
                }
            }
            emit('loadData')
            emit('update:drawer', false)
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
    if (form.repeatFrequency !== 'none') {
        const params = {
            title: form.title,
            description: form.description,
            anchorDate: toDateString(startsAt),
            recurrenceEndDate: form.recurrenceEndDate
                ? toLocalDateString(form.recurrenceEndDate)
                : null,
            startTime: toTimeString(startsAt),
            endTime: toTimeString(endsAt),
            repeatFrequency: form.repeatFrequency,
            isFixed: form.isFixed,
        }
        const res = await recurringEventApi.createRecurringEvent(params)
        if (res.message == 'Success') {
            ElMessage({
                type: 'success',
                message: '成功創建重複事件',
            })
        }
        return
    }
    const params = {
        title: form.title,
        description: form.description,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        priority: form.priority,
        status: form.status,
        isFixed: form.isFixed
    }
    const res = await eventApi.createEvent(params)
    if (res.message == 'Success') {
        ElMessage({
            type: 'success',
            message: '成功創建事件',
        })
        if (form.status === 'todo') {
            await triggerDayReschedule(startsAt)
        }
    }
}

async function editEvent() {
    const startsAt = form.timeRange[0]
    const endsAt = form.timeRange[1]
    if (form.isRecurringView) {
        const deleteRes = await recurringEventApi.deleteRecurringEvent({
            recurringEventId: form.recurringEventId,
        })
        if (deleteRes.message !== 'Success') {
            return
        }
        const createRes = await eventApi.createEvent({
            title: form.title,
            description: form.description,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            priority: form.priority,
            status: form.status,
            isFixed: form.isFixed,
        })
        if (createRes.message == 'Success') {
            ElMessage({
                type: 'success',
                message: '成功將重複事件轉為單次事件',
            })
            if (form.status === 'todo') {
                await triggerDayReschedule(startsAt)
            }
        }
        return
    }
    if (form.repeatFrequency !== 'none') {
        const recurringParams = {
            title: form.title,
            description: form.description,
            anchorDate: toDateString(startsAt),
            recurrenceEndDate: form.recurrenceEndDate
                ? toLocalDateString(form.recurrenceEndDate)
                : null,
            startTime: toTimeString(startsAt),
            endTime: toTimeString(endsAt),
            repeatFrequency: form.repeatFrequency,
            isFixed: form.isFixed,
        }
        const deleteRes = await eventApi.deleteEvent({ eventId: form.eventId })
        if (deleteRes.message !== 'Success') {
            return
        }
        const createRes = await recurringEventApi.createRecurringEvent(recurringParams)
        if (createRes.message == 'Success') {
            ElMessage({
                type: 'success',
                message: '成功將事件轉為重複事件',
            })
        }
        return
    }
    const params = {
        eventId: form.eventId,
        title: form.title,
        description: form.description,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        priority: form.priority,
        status: form.status,
        isFixed: form.isFixed
    }
    const res = await eventApi.editEvent(params)
    if (res.message == 'Success') {
        ElMessage({
            type: 'success',
            message: '成功更新事件',
        })
        if (form.status === 'todo') {
            await triggerDayReschedule(startsAt)
        }
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

.mobile-datetime-range {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5vh;
}

.mobile-time-range {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 2vw;
}

.mobile-time-range > :deep(.van-field) {
    flex: 1;
    min-width: 0;
}

.footer {
    display: flex;
    justify-content: end;
    gap: 0.5vw;
}

.recurring-banner {
    background: #fdf6ec;
    border: 1px solid #faecd8;
    color: #b88230;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 13px;
}
</style>