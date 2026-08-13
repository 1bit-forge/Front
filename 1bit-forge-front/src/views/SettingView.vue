<template>
    <div class="settting-container">
        <el-form class="setting-form" :model="form" label-width="auto" label-position="left" size="large">
            <el-form-item label="Account">
                <el-input v-model="form.account" disabled/>
            </el-form-item>
            <el-form-item label="Username">
                <el-input v-model="form.username" disabled/>
            </el-form-item>
            <el-form-item label="Email">
                <el-input v-model="form.email" disabled/>
            </el-form-item>
        </el-form>
        <div class="setting-group">
            <div class="setting-block" @click="openDialog('changeProfile')">
                修改個人資料
            </div>
            <div class="setting-block" @click="openDialog('changeSleepTime')">
                修改排程喜好
            </div>
            <div class="setting-block" @click="openDialog('changePassword')">
                修改密碼
            </div>
        </div>
        <Btn fit-content @click="logout" style="margin-top: 1vh;">登出</Btn>
    </div>

    <MyDialog
        v-if="dialogTarget === 'changeProfile'"
        v-model:dialogVisible="showDialog"
        title="修改個人資料"
        :confirm-loading="profileLoading"
        @confirm="handleUpdateProfile"
    >
        <el-form :model="profileForm" label-width="auto" label-position="left" size="large">
            <el-form-item label="Username" :error="profileErrors.username">
                <el-input v-model="profileForm.username" />
            </el-form-item>
            <el-form-item label="Email" :error="profileErrors.email">
                <el-input v-model="profileForm.email" />
            </el-form-item>
        </el-form>
    </MyDialog>

    <MyDialog
        v-else-if="dialogTarget === 'changePassword'"
        v-model:dialogVisible="showDialog"
        title="修改密碼"
        :confirm-loading="changePasswordLoading"
        @confirm="handleChangePassword"
    >
        <el-form :model="changePasswordForm" label-width="auto" label-position="left" size="large">
            <PasswordField
                v-model="changePasswordForm.oldPassword"
                input-id="setting-old-password"
                label="舊密碼"
                :error="changePasswordErrors.oldPassword"
            />

            <PasswordField
                v-model="changePasswordForm.newPassword"
                input-id="setting-new-password"
                label="新密碼"
                hint="至少 8 個字元且須包含至少一個數字"
                :error="changePasswordErrors.newPassword"
            />
        </el-form>
    </MyDialog>

    <MyDialog
        v-else-if="dialogTarget === 'changeSleepTime'"
        v-model:dialogVisible="showDialog"
        title="修改排程喜好（系統會避開以下時段進行排程）"
        :confirm-loading="scheduleSaving"
        @confirm="handleSaveScheduleSettings"
    >
        <el-form label-width="120px" label-position="left" >
            <el-form-item label="睡眠時間">
                <div class="segment-row">
                    <template v-if="!isMobile">
                        <el-time-picker v-model="sleepTimeRange[0]" placeholder="開始時間" format="HH:mm" />
                        <span class="segment-range-separator">至</span>
                        <el-time-picker v-model="sleepTimeRange[1]" placeholder="結束時間" format="HH:mm" />
                    </template>
                    <template v-else>
                        <MobileTimePickerField v-model="sleepTimeRange[0]" placeholder="開始時間" use-utc />
                        <span class="segment-range-separator">至</span>
                        <MobileTimePickerField v-model="sleepTimeRange[1]" placeholder="結束時間" use-utc />
                    </template>
                </div>
            </el-form-item>
            <el-form-item v-for="segment in customTimeSegments" :key="segment.id">
                <template #label>
                    <el-input v-model="segment.label" placeholder="時段名稱" />
                </template>
                <div class="segment-row">
                    <template v-if="!isMobile">
                        <el-time-picker v-model="segment.range[0]" placeholder="開始時間" format="HH:mm" />
                        <span class="segment-range-separator">至</span>
                        <el-time-picker v-model="segment.range[1]" placeholder="結束時間" format="HH:mm" />
                    </template>
                    <template v-else>
                        <MobileTimePickerField v-model="segment.range[0]" placeholder="開始時間" use-utc />
                        <span class="segment-range-separator">至</span>
                        <MobileTimePickerField v-model="segment.range[1]" placeholder="結束時間" use-utc />
                    </template>
                    <el-icon class="segment-remove" @click="removeTimeSegment(segment.id)"><Delete /></el-icon>
                </div>
            </el-form-item>
            <div class="add-segment" @click="addTimeSegment">
                + 添加時間段
            </div>
        </el-form>
    </MyDialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import Btn from '@/components/Btn.vue';
import { useAuth, updateStoredUser } from '@/composables/useAuth';
import { useIsMobile } from '@/composables/useIsMobile';
import MyDialog from '@/components/MyDialog.vue';
import MobileTimePickerField from '@/components/common/MobileTimePickerField.vue';
import PasswordField from '@/components/auth/PasswordField.vue';
import { changePassword, updateProfile } from '@/api/auth';
import { ApiError } from '@/api/client';
import {
    getBlackoutWindowList,
    createBlackoutWindow,
    editBlackoutWindow,
    deleteBlackoutWindow,
} from '@/api/blackoutWindow';

const { logout } = useAuth();
const { isMobile } = useIsMobile();

const SLEEP_BLACKOUT_NAME = '睡眠時間'

const showDialog = ref(false)
const profileLoading = ref(false)
const changePasswordLoading = ref(false)
const dialogTarget = ref('')
const sleepTimeRange = ref([null, null])
const sleepWindowId = ref(null)
const customTimeSegments = ref([])
const scheduleSaving = ref(false)
let nextSegmentId = 1

function timeStringToDate(timeStr){
    if (!timeStr) return null
    const [h, m, s] = timeStr.split(':').map(Number)
    const d = new Date()
    d.setUTCHours(h, m, s || 0, 0)
    return d
}

function dateToTimeString(date){
    if (!date) return null
    const pad = n => String(n).padStart(2, '0')
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

function addTimeSegment(){
    customTimeSegments.value.push({ id: nextSegmentId++, remoteId: null, label: '', range: [null, null] })
}

async function removeTimeSegment(id){
    const segment = customTimeSegments.value.find(s => s.id === id)
    if (segment?.remoteId) {
        try {
            await deleteBlackoutWindow({ blackoutWindowId: segment.remoteId })
        } catch (err) {
            ElMessage.error(err instanceof ApiError ? err.message : '刪除失敗，請稍後再試')
            return
        }
    }
    customTimeSegments.value = customTimeSegments.value.filter(segment => segment.id !== id)
}

async function loadScheduleSettings(){
    try {
        const res = await getBlackoutWindowList()
        const windows = res.data ?? []

        const sleepWindow = windows.find(w => w.blackoutName === SLEEP_BLACKOUT_NAME)
        if (sleepWindow) {
            sleepWindowId.value = sleepWindow.blackoutWindowId
            sleepTimeRange.value = [
                timeStringToDate(sleepWindow.startTime),
                timeStringToDate(sleepWindow.endTime),
            ]
        } else {
            sleepWindowId.value = null
            sleepTimeRange.value = [null, null]
        }

        customTimeSegments.value = windows
            .filter(w => w.blackoutName !== SLEEP_BLACKOUT_NAME)
            .map(w => ({
                id: nextSegmentId++,
                remoteId: w.blackoutWindowId,
                label: w.blackoutName,
                range: [timeStringToDate(w.startTime), timeStringToDate(w.endTime)],
            }))
    } catch (err) {
        ElMessage.error(err instanceof ApiError ? err.message : '讀取排程喜好失敗，請稍後再試')
    }
}

async function saveWindow({ remoteId, label, range }){
    if (!range?.[0] || !range?.[1]) {
        if (remoteId) {
            await deleteBlackoutWindow({ blackoutWindowId: remoteId })
        }
        return null
    }

    const payload = {
        blackoutName: label,
        startTime: dateToTimeString(range[0]),
        endTime: dateToTimeString(range[1]),
    }

    if (remoteId) {
        await editBlackoutWindow({ blackoutWindowId: remoteId, ...payload })
        return remoteId
    }

    const res = await createBlackoutWindow(payload)
    return res.data.blackoutWindowId
}

async function handleSaveScheduleSettings(){
    scheduleSaving.value = true
    try {
        sleepWindowId.value = await saveWindow({
            remoteId: sleepWindowId.value,
            label: SLEEP_BLACKOUT_NAME,
            range: sleepTimeRange.value,
        })

        for (const segment of customTimeSegments.value) {
            segment.remoteId = await saveWindow({
                remoteId: segment.remoteId,
                label: segment.label,
                range: segment.range,
            })
        }

        ElMessage.success('排程喜好已更新')
        showDialog.value = false
    } catch (err) {
        ElMessage.error(err instanceof ApiError ? err.message : '儲存失敗，請稍後再試')
    } finally {
        scheduleSaving.value = false
    }
}

const form = reactive({
    account: '',
    username: '',
    email: ''
})

const profileForm = reactive({
    username: '',
    email: ''
})

const profileErrors = reactive({
    username: '',
    email: ''
})

const changePasswordForm = reactive({
    oldPassword: '',
    newPassword: ''
})

const changePasswordErrors = reactive({
    oldPassword: '',
    newPassword: ''
})

function resetChangePasswordDialog(){
    changePasswordForm.oldPassword = ''
    changePasswordForm.newPassword = ''
    changePasswordErrors.oldPassword = ''
    changePasswordErrors.newPassword = ''
}

function resetProfileDialogErrors(){
    profileErrors.username = ''
    profileErrors.email = ''
}

watch(showDialog, (visible) => {
    if (!visible) {
        resetChangePasswordDialog()
        resetProfileDialogErrors()
        sleepTimeRange.value = [null, null]
        sleepWindowId.value = null
        customTimeSegments.value = []
    }
})

function firstMessage(value){
    return Array.isArray(value) ? value[0] : value
}

async function handleChangePassword(){
    changePasswordErrors.oldPassword = ''
    changePasswordErrors.newPassword = ''
    changePasswordLoading.value = true
    try {
        await changePassword({
            oldPassword: changePasswordForm.oldPassword,
            newPassword: changePasswordForm.newPassword
        })
        ElMessage.success('密碼修改成功')
        showDialog.value = false
    } catch (err) {
        if (err instanceof ApiError && err.code === 400 && err.data) {
            changePasswordErrors.oldPassword = firstMessage(err.data.oldPassword) ?? ''
            changePasswordErrors.newPassword = firstMessage(err.data.newPassword) ?? ''
            if (!changePasswordErrors.oldPassword && !changePasswordErrors.newPassword) {
                ElMessage.error(err.message)
            }
        } else if (err instanceof ApiError && err.code === 401) {
            ElMessage.error('登入已過期，請重新登入')
        } else {
            ElMessage.error(err instanceof ApiError ? err.message : '連線失敗，請稍後再試')
        }
    } finally {
        changePasswordLoading.value = false
    }
}

async function handleUpdateProfile(){
    profileErrors.username = ''
    profileErrors.email = ''
    profileLoading.value = true
    try {
        const res = await updateProfile({
            username: profileForm.username,
            email: profileForm.email
        })
        form.username = res.data.username
        form.email = res.data.email
        updateStoredUser({ username: res.data.username, email: res.data.email })
        ElMessage.success('個人資料已更新')
        showDialog.value = false
    } catch (err) {
        if (err instanceof ApiError && err.code === 400 && err.data) {
            profileErrors.username = firstMessage(err.data.username) ?? ''
            profileErrors.email = firstMessage(err.data.email) ?? ''
            if (!profileErrors.username && !profileErrors.email) {
                ElMessage.error(err.message)
            }
        } else if (err instanceof ApiError && err.code === 401) {
            ElMessage.error('登入已過期，請重新登入')
        } else {
            ElMessage.error(err instanceof ApiError ? err.message : '連線失敗，請稍後再試')
        }
    } finally {
        profileLoading.value = false
    }
}

function loadData(){
    const userInfo = JSON.parse(localStorage.getItem('lumina_auth_user'))
    form.account = userInfo.account
    form.username = userInfo.username
    form.email = userInfo.email ?? ''
}

function openDialog(target){
    showDialog.value = true
    dialogTarget.value = target
    if (target === 'changeSleepTime') {
        loadScheduleSettings()
    }
    if (target === 'changeProfile') {
        profileForm.username = form.username
        profileForm.email = form.email
    }
}

loadData()
</script>

<style scoped>
.settting-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.setting-form,
.setting-group{
    width: 80%;
    max-width: 600px;
}

.setting-block{
    border: 1px solid lightgrey;
    padding: 0.8vh 2vw;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.setting-block:not(:first-child){
    border-top: none;
}

.setting-group .setting-block:first-child{
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.setting-group .setting-block:last-child{
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.setting-block:hover{
    background-color: #f5f5f5;
    border-color: #c0c4cc;
}

.segment-row{
    display: flex;
    align-items: center;
    width: 100%;
}

.segment-range-separator{
    margin: 0 0.5vw;
    color: #909399;
    flex-shrink: 0;
}

.segment-remove{
    margin-left: 0.8vw;
    cursor: pointer;
    color: #f56c6c;
    flex-shrink: 0;
}

/* .segment-remove:hover{
    color: #f56c6c;
} */

.add-segment{
    color: var(--el-color-primary);
    cursor: pointer;
    width: fit-content;
}
</style>