<template>
    <Header />
    <div style="height: 80px;"></div>

    <div class="profile-container">
      <div class="profile-header">
        <div>
          <div class="avatar-container" @mouseover="showEditOverlay = true" @mouseleave="showEditOverlay = false">
          <img :src="draftIcon || (record.icon ? `http://localhost:3000/uploads/${record.icon}` : user.avatar)" alt="User Avatar" class="avatar" />
          <div v-if="isEditing">
          <div v-if="showEditOverlay" class="edit-overlay" @click="triggerFileInput">
            <span>Edit</span>
          </div>
          <input type="file" ref="fileInputRef" @change="onImageChange" accept="image/*" class="file-input" style="display: none;" />
        </div>
        </div>
      </div>
      <h1>{{ username }}</h1>
    </div>
      
      <div class="profile-info">
        <h2>Profile Information</h2>
        <div>
          <strong>Email:</strong>
          <span v-if="!isEditing"><br>{{ record.email }}</span>
          <input v-else v-model="editedRecord.email" />
        </div>
        <div>
          <strong>Password:</strong>
          <span v-if="!isEditing"><br>{{ record.password }}</span>
          <input v-else v-model="editedRecord.password" />
        </div>    
        <button v-if="isEditing" @click="cancelEdit" class="back-button">Back</button>
        <button @click="toggleEdit" class="edit-button">
          {{ isEditing ? 'Submit' : 'Edit' }}
        </button>
      </div>
    </div>
    <Footer/>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Header from '@/components/Header.vue';
  import Footer from '@/components/Footer.vue'
  import 'bootstrap/dist/js/bootstrap.bundle.min.js'
  import { useRoute,useRouter } from 'vue-router';
  import axios from 'axios';
  import { jwtDecode } from 'jwt-decode'

  const route = useRoute();
  const router = useRouter();

  const record = ref({});
  const isEditing = ref(false);
  const editedRecord = ref({});
  
  const username = ref("");
  const email = ref("");
  const password = ref("");
  const icon = ref("");
  const gender = ref("");
  const student_id = ref("");

  
  
  const loadAsyncData = async () => {
    try {
      // Get the token from local storage    
      const token = localStorage.getItem('token');
  
  
      const decoded = jwtDecode(token);
      username.value = `${decoded.user.english_name} `;
      email.value = `${decoded.user.email} `;
      icon.value = `${decoded.user.icon} `;
      student_id.value = `${decoded.user.student_id} `;
    } catch (error) {
      console.log(error);
    }
  };

  
  onMounted(async () => {
    await loadAsyncData();
    const recordId = student_id.value; // Get the ID from the route
    try {
      const response = await axios.get(`/api/user/detail/${recordId}`); // Fetch the record details
      record.value = response.data; // Set the record data
      editedRecord.value = { 
        ...record.value,
      }; // Initialize editedRecord with formatted dates
    } catch (error) {
      console.error('Error fetching record details:', error);
    }
  });

  
  const toggleEdit = () => {
    if (isEditing.value) {
      // Submit changes
      updateRecord();
    }
    isEditing.value = !isEditing.value;
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    isEditing.value = false;
    draftIcon.value = null;
    editedRecord.value = { 
      ...record.value,
    }; // Reset to original record with formatted dates
  };

  const selectedImage = ref(null); // To store the selected image file
const showEditOverlay = ref(false); // To control the visibility of the edit overlay
const fileInputRef = ref(null); // Reference for the file input
const draftIcon = ref(null); // Variable to store the draft image URL

const onImageChange = async (event) => {
  const file = event.target.files[0];
  
  // Check if a file was selected
  if (file) {
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WEBP).');
      return; // Exit the function if the file type is invalid
    }

    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      draftIcon.value = e.target.result; // Update the draft icon preview
      selectedImage.value = file; // Store the selected image file
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  }
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click(); // Programmatically trigger the file input click
  }
};

const updateRecord = async () => {
  try {
    // Prepare form data for updating the record
    const formData = new FormData();
    formData.append('email', editedRecord.value.email); // Add other fields as necessary
    formData.append('password', editedRecord.value.password);
    
    // If an image is selected, append it to the form data
    if (selectedImage.value) {
      formData.append('icon', selectedImage.value);
    }

    // Update the record on the server
    await axios.put(`/api/user/detail/${record.value._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    record.value = { ...editedRecord.value }; // Update the local record
    alert('Profile updated successfully!'); // Simple feedback
  } catch (error) {
    console.error('Error updating record:', error);
    alert('Failed to update profile. Please try again.'); // Error feedback
  }
};

  const user = ref({
    username: '',
    email: '',
    avatar: 'https://via.placeholder.com/100', // Placeholder image
  });
  
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
  display: flex; /* Use flexbox for alignment */
  flex-direction: column; /* Stack items vertically */
  align-items: center; /* Center items horizontally */
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
  .avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%; /* Makes it a circle */
  overflow: hidden; /* Ensures the image doesn't overflow the circle */
  display: flex; /* Use flexbox to center the image */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  position: relative; /* Position relative for overlay */
}
  .edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(128, 128, 128, 0.5); /* Grey background with transparency */
  color: white;
  font-weight: bold;
  opacity: 0; /* Initially hidden */
  transition: opacity 0.3s; /* Smooth transition */
}

.avatar-container:hover .edit-overlay {
  opacity: 1; /* Show overlay on hover */
}

.file-input {
  display: none; /* Hide the file input */
}
  </style>

  
