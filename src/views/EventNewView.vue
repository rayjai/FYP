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
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <a href="/event"><i class='bx bx-arrow-back'></i></a>
                    </div>
                    <h2>Create New Event</h2>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="event-name">Event Name:</label>
                            <input type="text" id="event-name" v-model="eventName" placeholder="Enter event name">
                        </div>
                        <div class="grid2x1">
                            <div class="form-group">

                                <label for="event-date">Event Date:(From)</label>
                                <input type="date" id="event-date-from" v-model="eventDateFrom"
                                    placeholder="Enter event date">
                            </div>
                            <div class="form-group">
                                <label for="event-date">Event Date:(To)</label>
                                <input type="date" id="event-date-to" v-model="eventDateTo"
                                    placeholder="Enter event date">
                            </div>
                        </div>

                        <div class="grid2x1">
                            <div class="form-group">
                                <label for="event-time">Event Time:(Start)</label>
                                <input type="time" id="event-time-start" v-model="eventTimeStart"
                                    placeholder="Enter event time">
                            </div>
                            <div class="form-group">
                                <label for="event-time">Event Time:(End)</label>
                                <input type="time" id="event-time-end" v-model="eventTimeEnd"
                                    placeholder="Enter event time">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="event-name">Venue:</label>
                            <input type="text" id="venue" v-model="eventVenue" placeholder="Enter event venue">
                        </div>

                        <div class="form-group">
                            <label for="event-type">Event Type:</label>
                            <select id="event-type" v-model="eventType">
                                <option value="free">Free</option>
                                <option value="charged">Charged</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="eventType === 'charged'">
                            <label for="event-price">Event Price:</label>
                            <input type="number" id="event-price" placeholder="Enter event price" v-model="eventPrice">
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
                        <div class="form-group">
                            <label for="multiple-section">Multiple Section?</label>
                            <select id="multiple-section" v-model="multipleSection">
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="multipleSection === 'yes'">
                            <label for="section-select">Select Number of Sections:</label>
                            <select v-model="sectionNumber" id="section-select">
                                <option v-for="num in 19" :key="num + 1" :value="num + 1">{{ num + 1 }}</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="sectionNumber >= 2">
                            <template v-for="index in sectionNumber">
                                <label :for="'section' + index">Section {{ index }}</label>
                                <input type="time" :id="'section' + index" v-model="sections[index - 1]"
                                    placeholder="Enter event time">
                            </template>
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
            eventPrice: 0,
            eventPoster: null,
            eventName: '',
            eventDateFrom: '',
            eventDateTo: '',
            eventTimeStart: '',
            eventTimeEnd: '',
            eventDescription: '',
            eventVenue: '',
            multipleSection: 'no',
            sectionNumber: '0', // Default value
            sections: Array(20).fill(''), // Initialize for 20 sections
        }
    },
    watch: {
        sectionNumber(newVal) {
            // Ensure the sections array is updated based on the selected section number
            if (newVal > this.sections.length) {
                this.sections.push(...Array(newVal - this.sections.length).fill(''));
            } else {
                this.sections = this.sections.slice(0, newVal);
            }
        }
    },
    methods: {
        handleFileChange(event) {
            this.eventPoster = event.target.files[0];
        },
        handleSubmit() {
            const formData = new FormData();
            formData.append('eventName', this.eventName);
            formData.append('eventDateFrom', this.eventDateFrom);
            formData.append('eventDateTo', this.eventDateTo);
            formData.append('eventTimeStart', this.eventTimeStart);
            formData.append('eventTimeEnd', this.eventTimeEnd);
            formData.append('eventVenue', this.eventVenue);
            formData.append('eventType', this.eventType);
            formData.append('eventPrice', this.eventType === 'charged' ? this.eventPrice : 0);
            formData.append('eventDescription', this.eventDescription);
            formData.append('multipleSection', this.multipleSection);
            formData.append('sectionNumber', this.multipleSection === 'yes' ? this.sectionNumber : 0);
            formData.append('eventPoster', this.eventPoster);
            formData.append('sections', JSON.stringify(this.sections));


            axios.post('/api/eventnew', formData, {
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