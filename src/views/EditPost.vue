<template>
    <main>
        <Header />
        <div style="height: 80px;"></div>

            <div class="container">
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
                        <a href="/forum"><i class='bx bx-arrow-back'></i></a>
                    </div>
                    <h2>Edit Post</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="title">Title:</label>
                            <input type="text" id="title" v-model="post.title" placeholder="Enter title">
                        </div>
                        <div class="form-group">
                            <label for="description">Description:</label>
                            <textarea id="description" v-model="post.description" placeholder="Enter description"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Current Frame Photo 1</label>
                            <div v-if="post.eventPoster1">
                            <img :src="'http://localhost:3000/uploads/' + post.eventPoster1" alt="Current Event Poster" class="current-poster" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="poster1">Poster 1:</label>
                            <input type="file" id="poster1" accept=".pdf, .png, .jpg" @change="event => handleFileChange(event, 1)" />
                        </div>
                        <div class="form-group">
                            <label>Current Frame Photo 2</label>
                            <div v-if="post.eventPoster2">
                                <img :src="'http://localhost:3000/uploads/' + post.eventPoster2" alt="Current Event Poster" class="current-poster" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="poster2">Poster 2:</label>
                            <input type="file" id="poster2" accept=".pdf, .png, .jpg,.jpeg" @change="event => handleFileChange(event, 2)" />
                        </div>
                        <div class="form-group">
                            <label>Current Frame Photo 3</label>
                            <div v-if="post.eventPoster3">
                                <img :src="'http://localhost:3000/uploads/' + post.eventPoster3" alt="Current Event Poster" class="current-poster" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="poster3">Poster 3:</label>
                            <input type="file" id="poster3" accept=".pdf, .png, .jpg,.jpeg" @change="event => handleFileChange(event, 3)" />
                        </div>

                        <button type="submit">Update Event</button>
                    </form>
                </div>
            </div>
        
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css';



const route = useRoute();

let poster1 = ref(null);
let poster2 = ref(null);
let poster3 = ref(null);
let postid = route.params.id;
let post = ref({
    eventPoster1: null,
    eventPoster2: null,
    eventPoster3: null,
});



const fetchPost = async () => {
    const postId = postid;
    try {
        const response = await axios.get(`/api/post/detail/${postId}`);
        post.value = response.data; // Assuming the API returns the event object
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
    const postId = route.params.id;

    console.log(poster1.value, poster2.value, poster3.value); // Check file values

    const formData = new FormData();
    
    formData.append('title', post.value.title);
    formData.append('description', post.value.description); // Use club.value.description

    // Append the files to the correct database field names
    if (poster1.value) formData.append('eventPoster1', poster1.value);
    if (poster2.value) formData.append('eventPoster2', poster2.value);
    if (poster3.value) formData.append('eventPoster3', poster3.value);

    try {
        const response = await axios.put(`/api/editpost/${postId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(response.data);
        if (response.status === 200) {
            window.location.href = '/forum';
        }
    } catch (error) {
        console.error(error);
    }
};


onMounted(() => {
    fetchPost();
});
</script>