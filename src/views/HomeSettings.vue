<template>
    <div>
        <h2>Home Page content</h2>
        <form @submit.prevent="handleSubmit"> <!-- Bind the submit event -->
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" v-model="club.description" rows="4"></textarea> <!-- Use textarea -->
            </div>
            <div class="form-group">
                <label>Current Frame Photo 1</label>
                <div v-if="club.eventPoster1">
                    <img :src="'http://localhost:3000/uploads/' + club.eventPoster1" alt="Current Event Poster" class="current-poster" />
                </div>
            </div>
            <div class="form-group">
                <label for="poster1">Poster 1:</label>
                <input type="file" id="poster1" accept=".pdf, .png, .jpg" @change="event => handleFileChange(event, 1)" />
            </div>
            <div class="form-group">
                <label>Current Frame Photo 2</label>
                <div v-if="club.eventPoster2">
                    <img :src="'http://localhost:3000/uploads/' + club.eventPoster2" alt="Current Event Poster" class="current-poster" />
                </div>
            </div>
            <div class="form-group">
                <label for="poster2">Poster 2:</label>
                <input type="file" id="poster2" accept=".pdf, .png, .jpg" @change="event => handleFileChange(event, 2)" />
            </div>
            <div class="form-group">
                <label>Current Frame Photo 3</label>
                <div v-if="club.eventPoster3">
                    <img :src="'http://localhost:3000/uploads/' + club.eventPoster3" alt="Current Event Poster" class="current-poster" />
                </div>
            </div>
            <div class="form-group">
                <label for="poster3">Poster 3:</label>
                <input type="file" id="poster3" accept=".pdf, .png, .jpg" @change="event => handleFileChange(event, 3)" />
            </div>
            <button type="submit">Save</button>
        </form>
    </div>
</template>
<style>
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 10px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button[type="submit"] {
    background-color: #4CAF50;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css';

let poster1 = ref(null);
let poster2 = ref(null);
let poster3 = ref(null);
let club = ref({
    club_id: "6755de91eb5ae88eaeaf53e3",
    eventPoster1: null,
    eventPoster2: null,
    eventPoster3: null,
});

const route = useRoute();


const fetchClub = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    try {
        const response = await axios.get(`/api/club/detail/${clubId}`);
        club.value = response.data; // Assuming the API returns the event object
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

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

const handleSubmit = async () => { // Declare as async
    const clubId = "6755de91eb5ae88eaeaf53e3"; 

    console.log(poster1.value, poster2.value, poster3.value); // Check file values

    const formData = new FormData();
    
    formData.append('description', club.value.description); // Use club.value.description

    // Append the files to the correct database field names
    if (poster1.value) formData.append('eventPoster1', poster1.value);
    if (poster2.value) formData.append('eventPoster2', poster2.value);
    if (poster3.value) formData.append('eventPoster3', poster3.value);

    try {
        const response = await axios.put(`/api/editclub/${clubId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(response.data);
        if (response.status === 200) {
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error(error);
    }
};


onMounted(() => {
    fetchClub();
});
</script>
