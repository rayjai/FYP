<template>
    <div>
      <h2>Profile Settings</h2>
      <!-- Add your profile settings form here -->
      <form>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" />
        <button type="submit">Save</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const username = ref('');
  </script>