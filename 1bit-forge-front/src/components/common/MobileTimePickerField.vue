<template>
    <van-field
        :model-value="displayText"
        readonly
        is-link
        :placeholder="placeholder"
        @click="openPopup"
    />
    <van-popup v-model:show="showPopup" position="bottom" round teleport="body" :z-index="3000">
        <van-time-picker
            v-model="pickerValue"
            title="選擇時間"
            :columns-type="['hour', 'minute']"
            @confirm="onConfirm"
            @cancel="showPopup = false"
        />
    </van-popup>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: Date,
        default: null,
    },
    placeholder: {
        type: String,
        default: '選擇時間',
    },
    // SettingView 的睡眠/黑名單時段以 UTC 時分儲存（沿用既有 timeStringToDate/dateToTimeString 語意）；
    // 事件實際時間則需保留本地時區的日期部分，只換算本地時分。
    useUtc: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue'])

const showPopup = ref(false)
const pickerValue = ref(['00', '00'])

function pad(n) {
    return String(n).padStart(2, '0')
}

const displayText = computed(() => {
    if (!props.modelValue) return ''
    const hours = props.useUtc ? props.modelValue.getUTCHours() : props.modelValue.getHours()
    const minutes = props.useUtc ? props.modelValue.getUTCMinutes() : props.modelValue.getMinutes()
    return `${pad(hours)}:${pad(minutes)}`
})

function openPopup() {
    if (props.modelValue) {
        const hours = props.useUtc ? props.modelValue.getUTCHours() : props.modelValue.getHours()
        const minutes = props.useUtc ? props.modelValue.getUTCMinutes() : props.modelValue.getMinutes()
        pickerValue.value = [pad(hours), pad(minutes)]
    } else {
        pickerValue.value = ['00', '00']
    }
    showPopup.value = true
}

function onConfirm({ selectedValues }) {
    const [hourStr, minuteStr] = selectedValues
    const hours = Number(hourStr)
    const minutes = Number(minuteStr)
    const next = props.modelValue ? new Date(props.modelValue) : new Date()
    if (props.useUtc) {
        next.setUTCHours(hours, minutes, 0, 0)
    } else {
        next.setHours(hours, minutes, 0, 0)
    }
    emit('update:modelValue', next)
    showPopup.value = false
}
</script>
