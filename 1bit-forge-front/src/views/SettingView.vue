<template>
    <div class="settting-container">
        <el-form class="setting-form" :model="form" label-width="auto" label-position="left" size="large">
            <el-form-item label="Account">
                <el-input v-model="form.account" disabled/>
            </el-form-item>
            <el-form-item label="Username">
                <el-input v-model="form.username" disabled/>
            </el-form-item>
        </el-form>
        <div class="setting-block" @click="openDialog('changeSleepTime')">
            修改排程喜好
        </div>
        <div class="setting-block" @click="openDialog('changePassword')">
            修改密碼
        </div>
        <Btn fit-content @click="logout" style="margin-top: 1vh;">登出</Btn>
    </div>

    <MyDialog
        v-if="dialogTarget === 'changePassword'"
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
                @enter="handleChangePassword"
            />

            <PasswordField
                v-model="changePasswordForm.newPassword"
                input-id="setting-new-password"
                label="新密碼"
                hint="至少 8 個字元且須包含至少一個數字"
                :error="changePasswordErrors.newPassword"
                @enter="handleChangePassword"
            />
        </el-form>
    </MyDialog>

    <MyDialog
        v-else-if="dialogTarget === 'changeSleepTime'"
        v-model:dialogVisible="showDialog"
        title="修改排程喜好（系統會避開以下時段進行排程）"
    >
        <p>功能開發中</p>   
    </MyDialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import Btn from '@/components/Btn.vue';
import { useAuth } from '@/composables/useAuth';
import MyDialog from '@/components/MyDialog.vue';
import PasswordField from '@/components/auth/PasswordField.vue';
import { changePassword } from '@/api/auth';
import { ApiError } from '@/api/client';

const { logout } = useAuth();

const showDialog = ref(false)
const changePasswordLoading = ref(false)
const dialogTarget = ref('')

const form = reactive({
    account: '',
    username: ''
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

watch(showDialog, (visible) => {
    if (!visible) resetChangePasswordDialog()
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

function loadData(){
    const userInfo = JSON.parse(localStorage.getItem('lumina_auth_user'))
    form.account = userInfo.account
    form.username = userInfo.username
}

function openDialog(target){
    showDialog.value = true
    dialogTarget.value = target
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
.setting-block{
    width: 80%;
    max-width: 600px;
}

.setting-block{
    border: 1px solid lightgrey;
    border-radius: 8px;
    padding: 0.8vh 2vw;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.setting-block:hover{
    background-color: #f5f5f5;
    border-color: #c0c4cc;
}
</style>