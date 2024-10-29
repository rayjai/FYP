<template>
    <Header />
    <div class="profile-container">
      <div class="profile-header">
        <img :src="user.avatar" alt="User Avatar" class="avatar" />
        <h1>{{ user.username }}</h1>
      </div>
      
      <div class="profile-info">
        <h2>Profile Information</h2>
        <div>
          <label for="email">Email:</label>
          <input v-model="user.email" id="email" readonly />
        </div>
        <div>
          <label for="bio">Bio:</label>
          <textarea v-model="user.bio" id="bio" readonly></textarea>
        </div>
        <button @click="isEditing = true">Edit Profile</button>
      </div>
  
      <div v-if="isEditing" class="edit-profile">
        <h2>Edit Profile</h2>
        <div>
          <label for="edit-email">Email:</label>
          <input v-model="user.email" id="edit-email" />
        </div>
        <div>
          <label for="edit-bio">Bio:</label>
          <textarea v-model="user.bio" id="edit-bio"></textarea>
        </div>
        <button @click="saveProfile">Save Changes</button>
        <button @click="isEditing = false">Cancel</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Header from '@/components/Header.vue';
  
  const user = ref({
    username: 'john_doe',
    email: 'john@example.com',
    bio: 'Hello! I am a software developer.',
    avatar: 'https://via.placeholder.com/100', // Placeholder image
  });
  
  const isEditing = ref(false);
  
  const saveProfile = () => {
    console.log('Profile saved:', user.value);
    isEditing.value = false;
  };
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: center; /* Center text */
  }
  
  .profile-header {
    margin-bottom: 20px;
  }
  
  .avatar {
    width: 100px; /* Circle width */
    height: 100px; /* Circle height */
    border-radius: 50%; /* Circle shape */
    object-fit: cover; /* Maintain aspect ratio */
  }
  
  .profile-info, .edit-profile {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-top: 10px;
  }
  
  input, textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
  }
  
  button {
    margin-top: 10px;
  }
  </style>
  