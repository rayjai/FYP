<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, watch } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css';

let isAdmin = ref(false);
let event = ref({
    sectionNumber: 2,
    sections: [],
});

const route = useRoute();

const checkrole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        if (decoded.user.role === 'admin') {
            isAdmin.value = true;
        }
    }
}

const fetchEvent = async () => {
    const eventId = route.params.id; // Get the event ID from the route parameters
    try {
        const response = await axios.get(`/api/event/detail/${eventId}`);
        event.value = response.data; // Assuming the API returns the event object
        event.sections = response.data.sections;// Populate sections from API
        console.log(event.value);
    } catch (error) {
        console.error(error);
    }
}

onMounted(() => {
    checkrole();
    fetchEvent();
});


</script>

<template>
    <main>
        <Header />
        <div v-if="isAdmin">
            <div class="container">
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <a href="/event"><i class='bx bx-arrow-back'></i></a>
                    </div>
                    <h2>Edit Event</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="event-name">Event Name:</label>
                            <input type="text" id="event-name" v-model="event.eventName" placeholder="Enter event name">
                        </div>
                        <div class="grid2x1">
                            <div class="form-group">
                                <label for="event-date">Event Date:(From)</label>
                                <input type="date" id="event-date-from" v-model="event.eventDateFrom">
                            </div>
                            <div class="form-group">
                                <label for="event-date">Event Date:(To)</label>
                                <input type="date" id="event-date-to" v-model="event.eventDateTo">
                            </div>
                        </div>

                        <div class="grid2x1">
                            <div class="form-group">
                                <label for="event-time">Event Time:(Start)</label>
                                <input type="time" id="event-time-start" v-model="event.eventTimeStart">
                            </div>
                            <div class="form-group">
                                <label for="event-time">Event Time:(End)</label>
                                <input type="time" id="event-time-end" v-model="event.eventTimeEnd">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="venue">Venue:</label>
                            <input type="text" id="venue" v-model="event.eventVenue" placeholder="Enter event venue">
                        </div>

                        <div class="form-group">
                            <label for="event-type">Event Type:</label>
                            <select id="event-type" v-model="event.eventType">
                                <option value="free">Free</option>
                                <option value="charged">Charged</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="event.eventType === 'charged'">
                            <label for="event-price">Event Price:</label>
                            <input type="number" id="event-price" placeholder="Enter event price"
                                v-model="event.eventPrice">
                        </div>
                        <div class="form-group">
                            <label for="event-poster">Event Poster:</label>
                            <input type="file" id="eventPoster" accept=".pdf, .png, .jpg" @change="handleFileChange" />
                        </div>
                        <div class="form-group">
                            <label for="event-description">Event Description:</label>
                            <textarea id="event-description" v-model="event.eventDescription"
                                placeholder="Enter event description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="multiple-section">Multiple Section?</label>
                            <select id="multiple-section" v-model="event.multipleSection">
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="event.multipleSection === 'yes'">
                            <label for="section-select">Select Number of Sections:</label>
                            <select v-model="event.sectionNumber" id="section-select">
                                <option v-for="num in 19" :key="num + 1" :value="num + 1">{{ num + 1 }}</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="event.sectionNumber > 1">
                            <div v-for="index in event.sectionNumber" :key="index">
                                <label :for="'section' + index">Section {{ index }}</label>
                                <input type="time" :id="'section' + index" v-model="event.sections[index - 1]"
                                    placeholder="Enter event time">
                            </div>
                        </div>

                        <button type="submit">Update Event</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
export default {
    methods: {
        handleFileChange(event) {
            event.poster = event.target.files[0];
        },
        handleSubmit() {
            const formData = new FormData();
            formData.append('eventName', event.eventName);
            formData.append('eventDateFrom', event.eventDateFrom);
            formData.append('eventDateTo', event.eventDateTo);
            formData.append('eventTimeStart', event.eventTimeStart);
            formData.append('eventTimeEnd', event.eventTimeEnd);
            formData.append('eventVenue', event.eventVenue);
            formData.append('eventType', event.eventType);
            formData.append('eventPrice', event.eventType === 'charged' ? event.eventPrice : 0);
            formData.append('eventDescription', event.eventDescription);
            formData.append('multipleSection', event.multipleSection);
            formData.append('sectionNumber', event.multipleSection === 'yes' ? event.sectionNumber : 0);
            formData.append('eventPoster', event.poster);
            formData.append('sections', JSON.stringify(event.sections));

            axios.put(`/api/event/${route.params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    console.log(response.data);
                    if (response.status === 200) {
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
