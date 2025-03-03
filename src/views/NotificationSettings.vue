<template>
    <div>
      <h2>Notification Settings</h2>
      <!-- Add your notification settings form here -->
      <form>
        <label>
          <input type="checkbox" v-model="emailNotifications" />
          Email Notifications
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const emailNotifications = ref(false);
  </script>