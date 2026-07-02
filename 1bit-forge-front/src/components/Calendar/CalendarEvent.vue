<template>
    <div
        class="event-container"
        :data-event-id="event.eventId"
        :class="{
            'is-continues-left': continuesLeft,
            'is-continues-right': continuesRight,
            'is-hovered': isHovered,
        }"
        
    >
        <p v-if="showTitle">{{ event.eventName }}</p>
        <span v-else class="event-container__spacer" aria-hidden="true"></span>
    </div>
</template>

<script setup>
const props = defineProps({
    event: {
        type: Object,
        required: true,
    },
    continuesLeft: {
        type: Boolean,
        default: false,
    },
    continuesRight: {
        type: Boolean,
        default: false,
    },
    showTitle: {
        type: Boolean,
        default: true,
    },
    isHovered: {
        type: Boolean,
        default: false,
    },
})

// const emit = defineEmits(['click'])

// function onClick() {
//     emit('click', props.event)
// }
</script>

<style scoped>
.event-container {
    width: 95%;
    margin: 0 auto;
    background-color: var(--Primary);
    color: var(--White);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    line-height: 1.4;
    position: relative;
    z-index: 1;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
}

.event-container p {
    margin: 0;
}

.event-container__spacer {
    display: block;
    height: 1.4em;
}

.event-container.is-hovered {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    z-index: 2;
}

.is-continues-left {
    margin-left: -1px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.is-continues-right {
    width: 95%;
    margin-right: -1px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
</style>
