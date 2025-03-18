<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';
import { useRoute,useRouter } from 'vue-router';

const router = useRouter();


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

const events = ref([]);


async function fetchRegisteredEvents() {
    const eventId = route.params.id;

    try {
        const response = await fetch(`/api/admincheckregistrations/` + eventId);
        const registrationData = await response.json();
        events.value = registrationData;
        console.log(registrationData);
        transformedEvents.value = registrationData.map(student => ({
            student_id: student.student_id,
            attendance: student.attendance !== undefined ? (student.attendance ? 'Present' : 'Absent') : 'N/A',
        }));

    } catch (error) {
        console.error('Error fetching registered events:', error);
    }
}

const transformedEvents = ref([]);
onMounted(() => {
    checkrole();
    fetchEventDetails();
    fetchRegisteredEvents();
})

const confirmDelete = (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
        deleteEvent(eventId);
    }
};

const deleteEvent = async (eventId) => {
    try {
        await axios.delete(`/api/event/${eventId}`); // Adjust the API endpoint as needed
        // Optionally, refresh the list or redirect after deletion
        router.push('/event'); // Redirect to the events page after deletion
    } catch (error) {
        console.error('Error deleting event:', error);
    }
};
</script>

<template>
    <Header />
    <div style="height: 80px;"></div>

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
                $ {{ event.eventPrice }}
            </span>
        </p>
        <p><strong>Venue: </strong> {{ event.eventVenue }} </p>

        <div v-if="isAdmin">
            <div class="button-container">
                <a :href="'/event/edit/' + event._id" class="btn btn-primary" @click.stop>
                    Edit
                </a>
                <div v-if="new Date(event.eventDateFrom) > new Date()">
                    <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
                </div>
                <a @click.stop="confirmDelete(event._id)" class="btn btn-danger">
        Delete
    </a>
            </div>
            <div class="profile-info">
                <div class="data-table-container">
                <h4>Registered Members</h4>
                <DataTable v-if="events" :value="transformedEvents" :paginator="true" :rows="5" :filterDelay="200">
                    <Column field="student_id" header="Student Id" />
                    <Column field="attendance" header="Attendance" />
                </DataTable>
                <p v-else>No registered events found.</p>
                </div>
            </div>
        </div>
        <div v-else-if="isStudent">
            <div class="button-container">
                <div v-if="new Date(event.eventDateFrom) > new Date()">
                    <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="button-container">
                <div v-if="new Date(event.eventDateFrom) > new Date()">
                    <a :href="'/signup'" class="btn btn-primary" @click.stop>Register</a>
                </div>
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

.data-table-container {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    margin-top: 20px;
    background-color: #f9f9f9;
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
