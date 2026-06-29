<template>
    <el-drawer v-model="visible" title="I am the title" direction="rtl">
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
import EventEdit from './EventEdit.vue';

const props = defineProps({
    drawer: {
        type: Boolean,
        default: false,
    },

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
