<template>
    <div class="settting-container">
        <el-form :model="form" label-width="auto" style="max-width: 600px;" label-position="left" size="large">
            <el-form-item label="Account">
                <el-input v-model="form.account" disabled/>
            </el-form-item>
            <el-form-item label="Username">
                <el-input v-model="form.username" disabled/>
            </el-form-item>
        </el-form>
        <Btn fit-content @click="logout">登出</Btn>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import Btn from '@/components/Btn.vue';
import { useAuth } from '@/composables/useAuth';

const { logout } = useAuth();


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
</style>