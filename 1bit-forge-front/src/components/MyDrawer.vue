<template>
    <el-drawer v-model="visible" :title="title" :direction="direction" :size="size"
        :style="isMobile ? {} : { 'max-width': maxWidth, 'min-width': minWidth }">
        <slot></slot>
        <!-- <template #footer>
            <div style="flex: auto">
                <el-button @click="cancelClick">cancel</el-button>
                <el-button type="primary" @click="confirmClick">confirm</el-button>
            </div>
        </template> -->
    </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useIsMobile } from '@/composables/useIsMobile'

const { isMobile } = useIsMobile()

const props = defineProps({
    drawer: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: ""
    },
    minWidth: {
        type: String,
        default: "400px"
    },
    maxWidth: {
        type: String,
        default: "600px"
    }
})

const emit = defineEmits(['update:drawer'])

const visible = computed({
    get: () => props.drawer,
    set: (value) => emit('update:drawer', value),
})

const direction = computed(() => (isMobile.value ? 'btt' : 'rtl'))
const size = computed(() => (isMobile.value ? '85%' : '30%'))


</script>

<style scoped></style>
