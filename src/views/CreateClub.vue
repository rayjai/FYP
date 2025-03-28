<template>
    <main>
        <Header />
        <div style="height: 80px;"></div>

        <div v-if="isAdmin">
            <div class="container">
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <h2>Create New Club</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="club-name">Club Name:</label>
                            <input type="text" id="club-name" v-model="clubName" placeholder="Enter club name" />
                        </div>
                        <div class="form-group">
                            <label for="description">Description:</label>
                            <textarea id="description" v-model="description" placeholder="Enter description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="poster1">Poster 1:</label>
                            <input type="file" id="poster1" accept=".pdf, .png, .jpg"
                                @change="event => handleFileChange(event, 1)" />
                        </div>
                        <div class="form-group">
                            <label for="poster2">Poster 2:</label>
                            <input type="file" id="poster2" accept=".pdf, .png, .jpg"
                                @change="event => handleFileChange(event, 2)" />
                        </div>
                        <div class="form-group">
                            <label for="poster3">Poster 3:</label>
                            <input type="file" id="poster3" accept=".pdf, .png, .jpg"
                                @change="event => handleFileChange(event, 3)" />
                        </div>

                        <div class="form-group">
                            <label for="philosophy">Philosophy:</label>
                            <textarea id="philosophy" v-model="philosophy" placeholder="Enter philosophy"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="logomeaning">Logo Meaning:</label>
                            <textarea id="logomeaning" v-model="logoMeaning"
                                placeholder="Enter logo meaning"></textarea>
                        </div>

                        <!-- New Fields -->
                        <div class="form-group">
                            <label for="webIcon">Web Icon:</label>
                            <input type="file" id="webIcon" accept=".png, .jpg"
                                @change="event => handleFileChange(event, 'webIcon')" />
                        </div>
                        <div class="form-group">
                            <label for="backgroundImage">Background Image:</label>
                            <input type="file" id="backgroundImage" accept=".png, .jpg"
                                @change="event => handleFileChange(event, 'backgroundImage')" />
                        </div>
                        <div class="form-group">
                            <label for="logoImage">Logo Image:</label>
                            <input type="file" id="logoImage" accept=".png, .jpg"
                                @change="event => handleFileChange(event, 'logoImage')" />
                        </div>
                        <div class="form-group">
                            <label for="aboutImage">About Image:</label>
                            <input type="file" id="aboutImage" accept=".png, .jpg"
                                @change="event => handleFileChange(event, 'aboutImage')" />
                        </div>

                        <!-- New FPS Payment Number Field -->
                        <div class="form-group">
                            <label for="fpsPaymentNumber">FPS Payment Number:</label>
                            <input type="text" id="fpsPaymentNumber" v-model="fpsPaymentNumber" placeholder="Enter FPS Payment Number" />
                        </div>

                        <button type="submit">Create Club</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue';
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import '@/assets/css/event.css';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

let isAdmin = ref(false);
let isStudent = ref(false);

// Form data
let clubName = ref('');
let description = ref('');
let philosophy = ref('');
let logoMeaning = ref('');
let poster1 = ref(null);
let poster2 = ref(null);
let poster3 = ref(null);

// New reactive references for additional images
let webIcon = ref(null);
let backgroundImage = ref(null);
let logoImage = ref(null);
let aboutImage = ref(null);

// New reference for FPS Payment Number
let fpsPaymentNumber = ref('');

// Check user role
const checkRole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        if (decoded.user.role === 'admin') {
            isAdmin.value = true;
        }
        if (decoded.user.role === 'student') {
            isStudent.value = true;
        }
    }
};

// Handle file change
const handleFileChange = (event, fileType) => {
    const file = event.target.files[0]; // Get the first file
    if (fileType === 1) {
        poster1.value = file; // Store the file in the reactive reference
    } else if (fileType === 2) {
        poster2.value = file;
    } else if (fileType === 3) {
        poster3.value = file;
    } else if (fileType === 'webIcon') {
        webIcon.value = file;
    } else if (fileType === 'backgroundImage') {
        backgroundImage.value = file;
    } else if (fileType === 'logoImage') {
        logoImage.value = file;
    } else if (fileType === 'aboutImage') {
        aboutImage.value = file;
    }
};

// Handle form submission
const handleSubmit = () => {
    console.log(poster1.value, poster2.value, poster3.value, webIcon.value, backgroundImage.value, logoImage.value, aboutImage.value, fpsPaymentNumber.value); // Check file values

    const formData = new FormData();
    formData.append('clubName', clubName.value);
    formData.append('description', description.value);
    formData.append('philosophy', philosophy.value);
    formData.append('logoMeaning', logoMeaning.value);
    if (poster1.value) formData.append('poster1', poster1.value);
    if (poster2.value) formData.append('poster2', poster2.value);
    if (poster3.value) formData.append('poster3', poster3.value);
    if (webIcon.value) formData.append('webIcon', webIcon.value);
    if (backgroundImage.value) formData.append('backgroundImage', backgroundImage.value);
    if (logoImage.value) formData.append('logoImage', logoImage.value);
    if (aboutImage.value) formData.append('aboutImage', aboutImage.value);
    
    // Append FPS Payment Number
    if (fpsPaymentNumber.value) formData.append('fpsPaymentNumber', fpsPaymentNumber.value);

    axios.post('/api/createclub', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then((response) => {
            console.log(response.data);
            if (response.status === 201) {
                localStorage.setItem('toastrMessage', 'Club Created Successfully!');
                const message = localStorage.getItem('toastrMessage');
                window.location.href = '/event';
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

const message = localStorage.getItem('toastrMessage');
if (message) {
    toastr.success(message);
    localStorage.removeItem('toastrMessage'); // Clear the message after displaying
}

// Lifecycle hook
onMounted(() => {
    checkRole();
});
</script>

<style>
/* Add your styles here if needed */
</style>
