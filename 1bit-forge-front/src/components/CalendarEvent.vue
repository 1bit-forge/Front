<template>
    <div class="event-container">
        <p>{{ event.eventName }}</p>
    </div>
</template>

<script setup>
defineProps({
    event: {
        type: Object,
        required: true,
    },
})
</script>

<style scoped>
.event-container {
    background-color: var(--Primary);
    color: var(--White);
}
</style>
