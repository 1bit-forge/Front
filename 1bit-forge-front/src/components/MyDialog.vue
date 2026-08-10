<template>
    <el-dialog v-model="dialogVisible" title="Tips" width="500" :before-close="handleClose">
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
const props = defineEmits({
    
})
</script>

<style scoped></style>