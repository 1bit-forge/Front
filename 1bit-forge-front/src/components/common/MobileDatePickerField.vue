<template>
    <van-field
        :model-value="displayText"
        readonly
        is-link
        :placeholder="placeholder"
        @click="openPopup"
    />
    <van-popup v-model:show="showPopup" position="bottom" round teleport="body" :z-index="3000">
        <van-date-picker
            v-model="pickerValue"
            :title="title"
            :columns-type="columnsType"
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
        default: '選擇日期',
    },
    title: {
        type: String,
        default: '選擇日期',
    },
    // van-date-picker 僅支援 'year'/'month'/'day'，依需求可為 ['year','month'] 或 ['year','month','day']
    columnsType: {
        type: Array,
        default: () => ['year', 'month', 'day'],
    },
})

const emit = defineEmits(['update:modelValue'])

const showPopup = ref(false)
const pickerValue = ref([])

function pad(n) {
    return String(n).padStart(2, '0')
}

function columnValues(date) {
    const map = {
        year: String(date.getFullYear()),
        month: pad(date.getMonth() + 1),
        day: pad(date.getDate()),
    }
    return props.columnsType.map(key => map[key])
}

const displayText = computed(() => {
    if (!props.modelValue) return ''
    return columnValues(props.modelValue).join('/')
})

function openPopup() {
    pickerValue.value = columnValues(props.modelValue ?? new Date())
    showPopup.value = true
}

function onConfirm({ selectedValues }) {
    const parts = {}
    props.columnsType.forEach((key, index) => {
        parts[key] = Number(selectedValues[index])
    })
    const base = props.modelValue ?? new Date()
    const next = new Date(
        parts.year ?? base.getFullYear(),
        (parts.month ?? base.getMonth() + 1) - 1,
        parts.day ?? base.getDate(),
        base.getHours(),
        base.getMinutes(),
        base.getSeconds(),
        0,
    )
    emit('update:modelValue', next)
    showPopup.value = false
}
</script>
