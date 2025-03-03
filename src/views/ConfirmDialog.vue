<template>
    <div class="confirm-dialog-overlay" v-if="isVisible">
        <div class="confirm-dialog">
            <h3>{{ title }}</h3>
            <p>{{ message }}</p>
            <div class="confirm-dialog-buttons">
                <button @click="confirm">Yes</button>
                <button @click="cancel">No</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Confirm'
    },
    message: {
        type: String,
        default: 'Are you sure?'
    },
    isVisible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
    emit('confirm');
};

const cancel = () => {
    emit('cancel');
};
</script>

<style scoped>
.confirm-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.confirm-dialog {
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
}

.confirm-dialog-buttons {
    margin-top: 20px;
}

.confirm-dialog-buttons button {
    margin: 0 10px;
}
</style>