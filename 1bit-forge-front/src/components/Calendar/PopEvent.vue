<template>
    <div class="popEvent-container">
        <slot></slot>
    </div>
</template>

<script setup>

</script>

<style scoped>
.popEvent-container {
    box-sizing: border-box;
    background-color: var(--event-bg-color);
    border: 1.5px solid var(--event-border-color);
    border-radius: 4px;
    color: var(--event-text-color);
    font-size: 12px;
    padding: 0.3vw;
}

.popEvent-container:hover{
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    z-index: 2;
    cursor: pointer;
}
</style>