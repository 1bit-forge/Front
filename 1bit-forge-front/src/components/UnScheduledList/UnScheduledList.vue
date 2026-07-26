<template>
    <div class="list-container">
        <div class="event-container" v-for="event in eventList" :key="event.eventId"
            @click="editEvent(event)">
            {{ event.title }}
        </div>
    </div>

    <MyDrawer v-model:drawer="showDrawer" :title="drawerTitle">
        <EventEdit :event-data="eventData" :mode="drawerMode" calendarType="MONTH"
                @update:drawer="showDrawer = false" @loadData="emit('loadData')" />
    </MyDrawer>
</template>

<script setup>
import { ref } from 'vue';
import MyDrawer from '../MyDrawer.vue';
import EventEdit from '../EventEdit.vue';

const props = defineProps({
    eventList: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['loadData'])

const showDrawer = ref(false)
const drawerTitle = ref("")
const drawerMode = ref("")
const eventData = ref(null)

function editEvent(event) {
    eventData.value = event
    drawerTitle.value = "編輯事件"
    drawerMode.value = "EDIT"
    showDrawer.value = true
}
</script>

<style scoped>
.list-container{
    display: flex;
    flex-direction: column;
    gap: 1vh;
}

.event-container{
    width: 95%;
    left: 4px;
    right: 4px;
    background-color: var(--Primary);
    color: var(--White);
    border-radius: 6px;
    padding: 8px 0;
    text-align: center;
    font-size: 14px;
    line-height: 1.4;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
}

.event-container:hover{
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    z-index: 2;
}
</style>