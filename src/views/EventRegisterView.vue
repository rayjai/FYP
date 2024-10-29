<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'



let isAdmin = ref(false);
let isStudent = ref(false);


const checkrole = async () => {
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
}

onMounted(() => {
    checkrole();
});

</script>

<template>
    <main>
        <Header />
        <div v-if="isAdmin">
            <div class="container">
                <div class="form-container">
                    <h2>Create New Event</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="event-name">Event Name:</label>
                            <input type="text" id="event-name" v-model="eventName" placeholder="Enter event name">
                        </div>

                        <div class="form-group">
                            <label for="event-poster">Event Poster:</label>
                            <input type="file" id="eventPoster" accept=".pdf, .png, .jpg" @change="handleFileChange" />
                        </div>
                        <div class="form-group">
                            <label for="event-description">Event Description:</label>
                            <textarea id="event-description" v-model="eventDescription"
                                placeholder="Enter event description"></textarea>
                        </div>
                        <button type="submit">Create Event</button>
                    </form>
                </div>
            </div>

        </div>
    </main>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            eventType: 'free',
            eventPoster: null,
            eventDescription: ''
        }
    },
    methods: {
        handleFileChange(event) {
            this.eventPoster = event.target.files[0];
        },
        handleSubmit() {
            const formData = new FormData();
            formData.append('eventName', this.eventName);
            formData.append('eventDescription', this.eventDescription);
            formData.append('eventPoster', this.eventPoster);

            axios.post('/api/eventregister', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    console.log(response.data);
                    if (response.status === 201) {
                        window.location.href = '/event';
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
}

</script>