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
        <div>Change Password</div>
    </MyDialog>
</template>

<script setup>
import { reactive, ref } from 'vue';
import Btn from '@/components/Btn.vue';
import { useAuth } from '@/composables/useAuth';
import MyDialog from '@/components/MyDialog.vue';

const { logout } = useAuth();

const showDialog = ref(false)

const form = reactive({
    account: '',
    username: ''
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