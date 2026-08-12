<template>
    <el-dialog v-model="dialogVisible" :title="title" style="width: 80vw; max-width: 500px" @keydown.enter="handleEnter">
        <slot></slot>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" :loading="confirmLoading" @click="$emit('confirm')">
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
const props = defineProps({
    title: String,
    confirmLoading: { type: Boolean, default: false }
})
const emit = defineEmits(['confirm'])

function handleEnter(event){
    if (event.target.tagName === 'TEXTAREA') return
    if (props.confirmLoading) return
    event.preventDefault()
    emit('confirm')
}
</script>

<style scoped></style>