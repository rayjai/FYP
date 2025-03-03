<template>
    <main>
        <Header />
        <div style="height: 80px;"></div>

        <div>
            <div class="container">
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <h2>Create New Post</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="title">Post Title:</label>
                            <input type="text" id="title" v-model="title" placeholder="Enter post title" />
                        </div>
                        <div class="form-group">
                            <label for="description">Description:</label>
                            <textarea id="description" v-model="description" placeholder="Enter description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="poster1">Photo 1:</label>
                            <input type="file" id="poster1" accept=".pdf, .png, .jpg"
                                @change="event => handleFileChange(event, 1)" />
                        </div>
                        <div class="form-group">
                            <label for="poster2">Photo 2:</label>
                            <input type="file" id="poster2" accept=".pdf, .png, .jpg"
                                @change="event => handleFileChange(event, 2)" />
                        </div>
                        <div class="form-group">
                            <label for="poster3">Photo 3:</label>
                            <input type="file" id="poster3" accept=".pdf, .png, .jpg"
                                @change="event => handleFileChange(event, 3)" />
                        </div>

                        <button type="submit">Confirm</button>
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
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();


let isAdmin = ref(false);
let isStudent = ref(false);

// Form data
let title = ref('');
let description = ref('');
let studentid = ref(route.params.id);
let poster1 = ref(null);
let poster2 = ref(null);
let poster3 = ref(null);

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
const handleFileChange = (event, posterNumber) => {
    const file = event.target.files[0]; // Get the first file
    if (posterNumber === 1) {
        poster1.value = file; // Store the file in the reactive reference
    } else if (posterNumber === 2) {
        poster2.value = file;
    } else if (posterNumber === 3) {
        poster3.value = file;
    }


};

// Handle form submission
const handleSubmit = () => {
    console.log(poster1.value, poster2.value, poster3.value); // Check file values
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('student_id', studentid.value);

    if (poster1.value) formData.append('poster1', poster1.value);
    if (poster2.value) formData.append('poster2', poster2.value);
    if (poster3.value) formData.append('poster3', poster3.value);

    axios.post('/api/createpost', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then((response) => {
            console.log(response.data);
            if (response.status === 201) {
                window.location.href = '/forum';
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

// Lifecycle hook
onMounted(() => {
    checkRole();
});
</script>