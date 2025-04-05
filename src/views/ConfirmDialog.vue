<template>
    <transition name="fade">
      <div class="confirm-dialog-overlay" v-if="isVisible" @click.self="cancel">
        <transition name="scale">
          <div class="confirm-dialog">
            <div class="confirm-dialog-icon">
              <i class='bx bx-question-mark'></i>
            </div>
            <h3 class="confirm-dialog-title">{{ title }}</h3>
            <p class="confirm-dialog-message">{{ message }}</p>
            <div class="confirm-dialog-buttons">
              <button class="confirm-button" @click="confirm">
                <i class='bx bx-check'></i> Confirm
              </button>
              <button class="cancel-button" @click="cancel">
                <i class='bx bx-x'></i> Cancel
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    title: {
      type: String,
      default: 'Confirmation Required'
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed with this action?'
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
  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .scale-enter-active,
  .scale-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .scale-enter-from,
  .scale-leave-to {
    transform: scale(0.95);
    opacity: 0;
  }
  
  /* Overlay */
  .confirm-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }
  
  /* Dialog */
  .confirm-dialog {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    text-align: center;
    max-width: 400px;
    width: 100%;
    border-top: 4px solid #4a6fa5;
  }
  
  .confirm-dialog-icon {
    font-size: 3rem;
    color: #4a6fa5;
    margin-bottom: 15px;
  }
  
  .confirm-dialog-title {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 15px;
    font-weight: 600;
  }
  
  .confirm-dialog-message {
    color: #6c757d;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 25px;
  }
  
  /* Buttons */
  .confirm-dialog-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
  }
  
  .confirm-dialog-buttons button {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    border: none;
  }
  
  .confirm-button {
    background: #4a6fa5;
    color: white;
  }
  
  .confirm-button:hover {
    background: #3a5a8f;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(74, 111, 165, 0.3);
  }
  
  .cancel-button {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #e9ecef;
  }
  
  .cancel-button:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .confirm-dialog {
      padding: 20px;
    }
    
    .confirm-dialog-buttons {
      flex-direction: column;
    }
    
    .confirm-dialog-buttons button {
      width: 100%;
      justify-content: center;
    }
  }
  </style>