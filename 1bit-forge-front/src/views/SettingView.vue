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
        <div class="setting-block" @click="showDialog = true">
            修改密碼
        </div>
        <Btn fit-content @click="logout" style="margin-top: 1vh;">登出</Btn>
    </div>

    <MyDialog v-model:dialogVisible="showDialog" title="修改密碼">
        <el-form :model="changePasswordForm" label-width="auto" label-position="left" size="large">
            <PasswordField
                v-model="changePasswordForm.newPassword"
                input-id="setting-new-password"
                label="新密碼"
                hint="至少 8 個字元且須包含至少一個數字"
            />

            <PasswordField
                v-model="changePasswordForm.confirmPassword"
                input-id="setting-confirm-password"
                label="確認密碼"
            />
        </el-form>
    </MyDialog>
</template>

<script setup>
import { reactive, ref } from 'vue';
import Btn from '@/components/Btn.vue';
import { useAuth } from '@/composables/useAuth';
import MyDialog from '@/components/MyDialog.vue';
import PasswordField from '@/components/auth/PasswordField.vue';

const { logout } = useAuth();

const showDialog = ref(false)

const form = reactive({
    account: '',
    username: ''
})

const changePasswordForm = reactive({
    newPassword: '',
    confirmPassword: ''
})

function loadData(){
    const userInfo = JSON.parse(localStorage.getItem('lumina_auth_user'))
    form.account = userInfo.account
    form.username = userInfo.username
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
    padding: 0.8vw;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.setting-block:hover{
    background-color: #f5f5f5;
    border-color: #c0c4cc;
}
</style>