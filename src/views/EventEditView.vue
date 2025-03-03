<template>
    <main>
        <Header />
        <div style="height: 80px;"></div>

        <div v-if="isAdmin">
            <div class="container">
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
                        <a href="/event"><i class='bx bx-arrow-back'></i></a>
                    </div>
                    <h2>Edit Event</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="event-name">Event Name:</label>
                            <input type="text" id="event-name" v-model="event.eventName" placeholder="Enter event name" required>
                        </div>
                        <div class="grid2x1">
                            <div class="form-group">

                                <label for="event-date">Event Date:(From)</label>
                                <input type="date" id="event-date-from" :min="minDate" v-model="event.eventDateFrom"
                                    placeholder="Enter event date" required>
                            </div>
                            <div class="form-group">
                                <label for="event-date">Event Date:(To)</label>
                                <input type="date" id="event-date-to" :min="event.eventDateFrom" v-model="event.eventDateTo"
                                    placeholder="Enter event date" required>
                            </div>
                        </div>

                        <div class="grid2x1">
                            <div class="form-group">
                                <label for="event-time">Event Time:(Start)</label>
                                <input type="time" id="event-time-start" v-model="event.eventTimeStart"
                                    placeholder="Enter event time" required>
                            </div>
                            <div class="form-group">
                                <label for="event-time">Event Time:(End)</label>
                                <input type="time" id="event-time-end" :min="event.eventTimeStart" v-model="event.eventTimeEnd"
                                    placeholder="Enter event time" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="venue">Venue:</label>
                            <input type="text" id="venue" v-model="event.eventVenue" placeholder="Enter event venue" required>
                        </div>

                        <div class="form-group">
                            <label for="event-type">Event Type:</label>
                            <select id="event-type" v-model="event.eventType" required>
                                <option value="free">Free</option>
                                <option value="charged">Charged</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="event.eventType === 'charged'">
                            <label for="event-price">Event Price:</label>
                            <input type="number" id="event-price" placeholder="Enter event price" v-model="event.eventPrice" required>
                        </div>
                        <div class="form-group">
                            <label>Current Event Poster:</label>
                            <div v-if="event.eventPoster">
                                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" alt="Current Event Poster" class="current-poster" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="event-poster">Event Poster:</label>
                            <input type="file" id="eventPoster" accept=".pdf, .png, .jpg" @change="handleFileChange" />
                        </div>
                        <div class="form-group">
                            <label for="event-description">Event Description:</label>
                            <textarea id="event-description" v-model="event.eventDescription" placeholder="Enter event description" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="multiple-section">Multiple Section?</label>
                            <select id="multiple-section" v-model="event.multipleSection" required>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="event.multipleSection === 'yes'">
                            <label for="section-select">Select Number of Sections:</label>
                            <select v-model="event.sectionNumber" id="section-select" required>
                                <option v-for="num in 19" :key="num + 1" :value="num + 1">{{ num + 1 }}</option>
                            </select>
                        </div>


                        <button type="submit">Update Event</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref,computed } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css';

let isAdmin = ref(false);
let event = ref({
    sectionNumber: 2,
    eventPoster: null,
    poster: null,
});



// Get today's date in YYYY-MM-DD format
const today = new Date();
const minDate = computed(() => {
    return today.toISOString().split('T')[0]; // Format to YYYY-MM-DD
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
        event.value.sectionNumber = response.data.sectionNumber;
    } catch (error) {
        console.error(error);
    }
}

const handleFileChange = (fileInputEvent) => {
    // Check if a file was selected
    if (fileInputEvent.target.files.length > 0) {
        event.value.poster = fileInputEvent.target.files[0]; // Set the new poster file
    } else {
        event.value.poster = null; // Reset if no file is selected
    }
};

const handleSubmit = async () => {
    const dateFrom = new Date(event.value.eventDateFrom);
    const dateTo = new Date(event.value.eventDateTo);
    const timeStart = event.value.eventTimeStart.split(':');
    const timeEnd = event.value.eventTimeEnd.split(':');

    const startTime = new Date(dateFrom);
    startTime.setHours(timeStart[0], timeStart[1]);

    const endTime = new Date(dateTo);
    endTime.setHours(timeEnd[0], timeEnd[1]);

    // Check if the "To" date is earlier than the "From" date
    if (dateTo < dateFrom) {
        alert('The "To" date cannot be earlier than the "From" date.');
        return;
    }

    // Check if the end time is earlier than the start time only if the dates are the same
    if (dateFrom.getTime() === dateTo.getTime() && endTime < startTime) {
        alert('The end time cannot be earlier than the start time on the same day.');
        return;
    }

    // Check if the event is in the past
    const now = new Date();
    if (startTime < now) {
        alert('The event must be scheduled for the future.');
        return;
    }
    const formData = new FormData();
    formData.append('eventName', event.value.eventName);
    formData.append('eventDateFrom', event.value.eventDateFrom);
    formData.append('eventDateTo', event.value.eventDateTo);
    formData.append('eventTimeStart', event.value.eventTimeStart);
    formData.append('eventTimeEnd', event.value.eventTimeEnd);
    formData.append('eventVenue', event.value.eventVenue);
    formData.append('eventType', event.value.eventType);
    formData.append('eventPrice', event.value.eventType === 'charged' ? event.value.eventPrice : 0);
    formData.append('eventDescription', event.value.eventDescription);
    formData.append('multipleSection', event.value.multipleSection);
    formData.append('sectionNumber', event.value.multipleSection === 'yes' ? event.value.sectionNumber : 0);

    // Only append the new poster if it exists
    if (event.value.poster) {
        formData.append('eventPoster', event.value.poster);
    }


    try {
        const response = await axios.put(`/api/event/${route.params.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(response.data);
        if (response.status === 200) {
            window.location.href = '/event';
        }
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    checkrole();
    fetchEvent();
});
</script>