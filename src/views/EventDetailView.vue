<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'
import { useRoute } from 'vue-router';

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

const event = ref({});
const route = useRoute();

async function fetchEventDetails() {
    const eventId = route.params.id;
    try {
        const response = await fetch('/api/event/detail/' + eventId
            , { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
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
        <h1>{{ event.eventName }}</h1>
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

        <div v-if="isAdmin">
            <div class="button-container">
                <a :href="'/event/edit/' + event._id" class="btn btn-primary" @click.stop>
                    Edit
                </a>
                <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
            </div>
        </div>
        <div v-if="isStudent">
            <div class="button-container">
                <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
            </div>
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
