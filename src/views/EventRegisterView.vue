<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'
import { useRoute } from 'vue-router';

let isAdmin = ref(false);
let isStudent = ref(false);
const user = ref({});
const event_id = ref(null);


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
    sectionNumber: '2',
    sections: [],
});
const route = useRoute();
const termsAgreed = ref(false);
const termsContent = ref(null);

async function fetchEventDetails() {
    const eventId = route.params.id;
    event_id.value = route.params.id;
    try {
        const response = await fetch('/api/event/detail/' + eventId
            , { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
        console.log(event.value);
        event.sectionNumber = event.sectionNumber;
        event.sections = event.sections; // Initialize with empty strings
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
};
const checkScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = termsContent.value;
    termsAgreed.value = scrollTop + clientHeight >= scrollHeight;
};
onMounted(() => {
    checkrole();
    fetchEventDetails()
})

</script>

<template>
    <Header />
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
        <div v-if="isAdmin">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student id:</label>
                    <input type="text" id="student_id" v-model="student_id" placeholder="12345678">
                </div>
            </form>
        </div>
        <div v-if="isStudent">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student id:</label>
                    <input type="text" id="student_id" v-model="student_id" placeholder="12345678" disabled>
                </div>
                <input type="hidden" v-model="event_id" />
                <div v-if="event.sectionNumber != 0">
                    <div class="form-group">
                        <label>Select Session:</label>
                        <div style="display: flex;">
                            <div v-for="(session, index) in event.sections" :key="index"> <!-- Use index as key -->
                                <div class="radio-select">
                                    <input type="radio" :id="'session-' + index" :value="index"
                                        v-model="selectedSession" />
                                    <label :for="'session-' + index" style="padding-left: 10px; padding-bottom: 0px;">{{
                                        session }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="terms" ref="termsContent" @scroll="checkScroll" style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                        <h3>Terms of Agreement</h3>
                        <p>Your terms of agreement content goes here...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                        <p>Lorem ipsum dolor sit amet...</p>
                    </div>
                    <input type="checkbox" id="understand" :disabled="!termsAgreed" required />
                    <label for="understand" class="custom-checkbox-label">I understand that I should not register for an event I do not intend to attend.</label>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            student_id: '',
            selectedSession: null,
            event_id: '',
  
        };
    },
    methods: {
        handleSubmit() {
            const formData = new FormData();
            formData.append('student_id', this.student_id);
            formData.append('selectedSession', this.selectedSession);
            formData.append('event_id', this.event_id);
          
         


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
};
</script>

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
