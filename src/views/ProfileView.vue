<template>
  <Header />
  <div class="header-spacer"></div>

  <div class="profile-page">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-wrapper" @mouseover="showEditOverlay = true" @mouseleave="showEditOverlay = false">
          <img 
            :src="draftIcon || (record.icon ? `http://localhost:3000/uploads/${record.icon}` : defaultAvatar)" 
            alt="Profile Picture" 
            class="profile-avatar"
          />
          <div v-if="isEditing && showEditOverlay" class="avatar-edit-overlay" @click="triggerFileInput">
            <i class='bx bx-camera'></i>
            <span>Change Photo</span>
          </div>
          <input 
            type="file" 
            ref="fileInputRef" 
            @change="onImageChange" 
            accept="image/*" 
            class="file-input" 
          />
        </div>
        <h1 class="profile-name">{{ username }}</h1>
        <p class="profile-email">{{ record.email }}</p>
      </div>

      <div class="profile-content">
        <h2 class="section-title">Profile Information</h2>
        
        <div class="form-group">
          <label>Username</label>
          <div v-if="!isEditing" class="profile-field">{{ record.username }}</div>
          <input v-else v-model="editedRecord.username" class="form-input" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <div v-if="!isEditing" class="profile-field">{{ record.email }}</div>
          <input v-else v-model="editedRecord.email" type="email" class="form-input" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <div v-if="!isEditing" class="profile-field">••••••••</div>
          <input v-else v-model="editedRecord.password" type="input" class="form-input" />
        </div>

        <div class="action-buttons">
          <button v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="toggleEdit" class="btn btn-primary">
            {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <Footer />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const router = useRouter();
const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';


  const email = ref("");
  const password = ref("");
  const icon = ref("");
  const gender = ref("");
  const student_id = ref("");
const record = ref({});
const isEditing = ref(false);
const editedRecord = ref({});
const username = ref("");
const showEditOverlay = ref(false);
const fileInputRef = ref(null);
const draftIcon = ref(null);
const selectedImage = ref(null);

 
  
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
    formData.append('username', editedRecord.value.username);

    
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
    localStorage.setItem('toastrMessage', 'Profile updated successfully!');
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


  function displayToastrMessage() {
    const message = localStorage.getItem('toastrMessage');
    if (message) {
        toastr.success(message);
        localStorage.removeItem('toastrMessage'); // Clear the message after displaying
    }
}

// Call the function every second (1000 milliseconds)
setInterval(displayToastrMessage, 1000);
  

</script>

<style scoped>
/* Main Layout */
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 160px);
}

.header-spacer {
  height: 80px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

/* Profile Header */
.profile-header {
  background: linear-gradient(135deg, #4a6fa5 0%, #3a5a8f 100%);
  padding: 2.5rem 2rem;
  text-align: center;
  color: white;
  position: relative;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  position: relative;
  cursor: pointer;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-edit-overlay i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-wrapper:hover .profile-avatar {
  transform: scale(1.05);
}

.profile-name {
  font-size: 1.8rem;
  margin: 0.5rem 0 0;
  font-weight: 600;
}

.profile-email {
  opacity: 0.9;
  margin: 0;
  font-size: 1rem;
}

/* Profile Content */
.profile-content {
  padding: 2rem;
}

.section-title {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: #4a6fa5;
  border-radius: 3px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a6fa5;
}

.profile-field {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.1);
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: #4a6fa5;
  color: white;
}

.btn-primary:hover {
  background: #3a5a8f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 111, 165, 0.2);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
}

/* File Input */
.file-input {
  display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .profile-header {
    padding: 1.5rem 1rem;
  }
  
  .profile-content {
    padding: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
  
  