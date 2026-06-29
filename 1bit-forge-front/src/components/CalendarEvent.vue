<template>
    <div
        class="event-container"
        :class="{
            'is-continues-left': continuesLeft,
            'is-continues-right': continuesRight,
        }"
    >
        <p v-if="showTitle">{{ event.eventName }}</p>
        <span v-else class="event-container__spacer" aria-hidden="true"></span>
    </div>
</template>

<script setup>
defineProps({
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
})
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
}

.event-container p {
    margin: 0;
}

.event-container__spacer {
    display: block;
    height: 1.4em;
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
