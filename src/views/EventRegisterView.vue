<script setup>
import Header from '@/components/Header.vue'

import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
const router = useRouter();
const route = useRoute();

let isAdmin = ref(false);
let isStudent = ref(false);
const user = ref({});
const inieventid = ref(route.params.id);
const eventDateFrom = ref();
const eventName = ref();
const sectionNumber = ref();

let registrationData = ref({
    student_id: '',
    selectedSession: '0',
    multipleSection:'0',
    event_id: inieventid,
    attendance:false,
    eventName:eventName,
    eventFromDate:eventDateFrom.value,
});




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
        user.value = decoded.user;
    }
}

const event = ref({
   
});
const termsAgreed = ref(false);
const termsContent = ref(null);

async function fetchEventDetails() {
    const eventId = route.params.id;
    registrationData.event_id = route.params.id;
    try {
        const response = await fetch('/api/event/detail/' + eventId
            , { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
        console.log(event.value);
        sectionNumber.value = Number(event.value.sectionNumber);
        eventDateFrom.value = event.value.eventDateFrom;
        eventName.value = event.value.eventName;
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
};
const checkScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = termsContent.value;
    termsAgreed.value = scrollTop + clientHeight >= scrollHeight;
};

const handleSubmit = async () => {
    registrationData.eventName = eventName;
    registrationData.eventDateFrom = eventDateFrom.value;
    try {
        const response = await fetch('/api/eventregister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData.value)
        });

        if (!response.ok) {
            throw new Error('Error submitting register');
        }

        const data = await response.json();
        console.log(data);

        router.push('/event');
    } catch (error) {
        console.error('Error submitting register:', error);

        alert('Error register syllabus. Please try again.');
    }
}

onMounted(() => {
    checkrole();
    fetchEventDetails()
})

</script>

<template>
    <Header />
    <div style="height: 80px;"></div>

    <div class="event-detail">
        <div class="event-middle">
            <img :src="'http://localhost:3000/uploads/' + event.eventPoster" alt="Event Image" class="event-image" />
        </div>
        <h2>{{ event.eventName }}</h2>
        <p><strong>Description:</strong> {{ event.eventDescription }}</p>
        <p><strong>Date: </strong>
            <span v-if="event.eventDateFrom === event.eventDateTo">
                {{ event.eventDateFrom }}
            </span>
            <span v-else>
                {{ event.eventDateFrom }} - {{ event.eventDateTo }}
            </span>
        </p>
        <p><strong>Time: </strong> {{ event.eventTimeStart }} - {{ event.eventTimeEnd }}</p>
        <p><strong>Price: </strong>
            <span v-if='event.eventType === "free"'>
                -
            </span>
            <span v-else>
                {{ event.eventPrice }}
            </span>
        </p>
        <p><strong>Venue: </strong> {{ event.eventVenue }} </p>


    </div>
    <div class="register-info">

        <div v-if="isStudent">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student id:</label>
                    <input type="text" id="student_id" v-model="registrationData.student_id" placeholder="12345678"
                        required>
                </div>
                <div v-if="event.sectionNumber != 0">
                    <div class="form-group">
                        <label>Select Session:</label>
                        <div style="display: flex;">
                            <div v-for="(session, index) in event.sections" :key="index"> <!-- Use index as key -->
                                <div class="radio-select">
                                    <input type="radio" :id="'session-' + index" :value="index"
                                        v-model="registrationData.selectedSession" />
                                    <label :for="'session-' + index" style="padding-left: 10px; padding-bottom: 0px;">{{
                session }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else><input type="radio" value="0" v-model="registrationData.multipleSection" hidden /></div>
                <div class="form-group">
                    <div class="terms" ref="termsContent" @scroll="checkScroll"
                        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                        <h3>Terms of Agreement</h3>
                        <p>Your terms of agreement content goes here...</p>
                        <p>1. Member should attend the event.</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                    </div>
                    <input type="checkbox" id="understand" required />
                    <label for="understand" class="custom-checkbox-label">I have read and understand the terms of
                        agreement.</label>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
        <div v-if="isAdmin">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student id:</label>
                    <input type="text" id="student_id" v-model="registrationData.student_id" placeholder="12345678"
                        required>
                </div>
                <div v-if="event.sectionNumber != 0">
                    <div class="form-group">
                        <label>Select Session:</label>
                        <div style="display: flex; flex-direction: column;">
                    <div v-for="index in sectionNumber" :key="index">
                        <div class="radio-select">
                            <input type="radio" :id="'session-' + index" :value="index" v-model="registrationData.selectedSession" />
                            <label :for="'session-' + index" style="padding-left: 10px;">Session {{ index }}</label>
                        </div>
                    </div>
                </div>
                    </div>
                </div>
                <div v-else><input type="radio" value="0" v-model="registrationData.multipleSection" hidden /></div>
                <button type="submit">Register</button>
            </form>
        </div>
    </div>
</template>


<style scoped>
.event-detail {
    padding: 20px;
}

.event-image {
    max-width: 100%;
    height: auto;
}

.back-link {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
}

.back-link:hover {
    background-color: #0056b3;
}
</style>
