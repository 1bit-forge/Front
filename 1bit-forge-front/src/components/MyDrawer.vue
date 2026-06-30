<template>
    <el-drawer v-model="visible" :title="title" direction="rtl" style="max-width: 600px">
        <slot></slot>
        <template #footer>
            <div style="flex: auto">
                <el-button @click="cancelClick">cancel</el-button>
                <el-button type="primary" @click="confirmClick">confirm</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    drawer: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: ""
    }

})

const emit = defineEmits(['update:drawer'])

const visible = computed({
    get: () => props.drawer,
    set: (value) => emit('update:drawer', value),
})

function cancelClick() {
  visible.value = false
}

function confirmClick() {
  console.log("submit")
  visible.value = false
}


</script>

<style scoped></style>
