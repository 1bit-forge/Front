<template>
    <div class="popEvent-container">
        <slot></slot>
    </div>
</template>

<script setup>

</script>

<style scoped>
.popEvent-container {
    background-color: var(--Primary);
    border-radius: 4px;
    color: var(--White);
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