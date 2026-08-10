<template>
    <el-dialog v-model="dialogVisible" :title="title" width="500">
        <slot></slot>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogVisible = false">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
const dialogVisible = defineModel('dialogVisible', {
    type: Boolean,
    default: false
})
defineProps({
    title: String
})
</script>

<style scoped></style>