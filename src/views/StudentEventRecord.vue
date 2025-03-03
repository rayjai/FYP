<template>
    <Header />
    <div style="height: 80px;"></div>

    <div class="profile-container">
        <h2>Student Profile</h2>
        <div class="profile-header">
            <h3>{{ student.english_name }}</h3>
            <p>ID: {{ student.student_id }}</p>
        </div>

        <div class="profile-info">
            <h4>Registered Events</h4>
            <DataTable v-if="events" :value="transformedEvents" :paginator="true" :rows="5" :filterDelay="200">
                <Column field="event_name" header="Event Name" />
                <Column field="attendance" header="Attendance" />
            </DataTable>
            <p v-else>No registered events found.</p>
        </div>
    </div>

    <Footer />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { jwtDecode } from "jwt-decode";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const student = ref({});
const events = ref([]);

const getinfo = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        student.value = decoded.user;
    }
};

// Fetch registered events for the student
async function fetchRegisteredEvents() {
    try {
        if (student.value.student_id) {
            const response = await fetch(`/api/registrations/${student.value.student_id}`);
            const registrationData = await response.json();
            events.value = registrationData;
            console.log(registrationData);
            transformedEvents.value = registrationData.map(student => ({
                event_name: student.eventName,
                attendance: student.attendance !== undefined ? (student.attendance ? 'Present' : 'Absent') : 'N/A',
            }));
        }
    } catch (error) {
        console.error('Error fetching registered events:', error);
    }
}

const transformedEvents = ref([]);

onMounted(() => {
    getinfo();
    fetchRegisteredEvents();
});
</script>

<style scoped>
.profile-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: center;
    /* Center text */
}

.profile-header {
    margin-bottom: 20px;
}

.avatar {
    width: 100px;
    /* Circle width */
    height: 100px;
    /* Circle height */
    border-radius: 50%;
    /* Circle shape */
    object-fit: cover;
    /* Maintain aspect ratio */
}

.profile-info,
.edit-profile {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-top: 10px;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
}

button {
    margin-top: 10px;
}
</style>
