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
            <span v-if='event.eventType === "free"'>-</span>
            <span v-else>$ {{ event.eventPrice }}</span>
        </p>
        <p><strong>Venue: </strong> {{ event.eventVenue }} </p>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div v-if="isAdmin">
            <div class="button-container">
                <a :href="'/event/edit/' + event._id" class="btn btn-primary" @click.stop>Edit</a>
                <div v-if="new Date(event.eventDateFrom) > new Date()">
                    <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
                </div>
                <a @click.stop="confirmDelete(event._id)" class="btn btn-danger">Delete</a>

                <button @click.stop="stopRegistration(event._id)" class="btn btn-warning" v-if="event.canRegister">Stop Registration</button>
                <button @click.stop="resumeRegistration(event._id)" class="btn btn-success" v-if="!event.canRegister">Resume Registration</button>
            </div>
            <div class="profile-info" style="padding-top: 20px;">
                <h4>Registered Members</h4>
                <ag-grid-vue
                    class="ag-theme-alpine"
                    style="width: 100%; height: 500px;"
                    :columnDefs="memberColumnDefs"
                    :rowData="transformedEvents"
                    :pagination="true"
                    :paginationPageSize="10"
                    :defaultColDef="defaultColDef"
                    @rowClicked="onRowClickedMember">
                </ag-grid-vue>
            </div>
        </div>
        <div v-else-if="isStudent">
            <div class="button-container">
                <div v-if="isEventRegistered(event._id)">
                    <span class="registered">Already Registered</span>
                    <button @click.stop="cancelRegistration(event._id)" class="btn btn-danger" style="margin-left: 20px;">Cancel Registration</button>
                </div>
                <div v-else>
                    <div v-if="new Date(event.eventDateFrom) > new Date()">
                        <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
                    </div>
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

<script setup>
import Header from '@/components/Header.vue';
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import { AgGridVue } from "ag-grid-vue3"; // Import ag-grid-vue
import '@/assets/css/event.css'
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const student_id = ref("");
let isAdmin = ref(false);
let isStudent = ref(false);
const loading = ref(true);
const errorMessage = ref("");
const event = ref({});
const route = useRoute();
const events = ref([]);
const registeredEvents = ref(new Set());
const transformedEvents = ref([]);
const registrationCount = ref(0);

const memberColumnDefs = [
    { headerName: "Student ID", field: "student_id", sortable: true, filter: true },
    { headerName: "Attendance", field: "attendance", sortable: true, filter: true },
    { 
        headerName: "Payment Method", 
        field: "paymentMethod", 
        sortable: true, 
        filter: true 
    },
    { 
        headerName: "", 
        cellRenderer: params => `<button class="confirm-button">Confirm</button>`, 
        sortable: false, 
        filter: false 
    },
    { 
        headerName: "", 
        cellRenderer: params => `<button class="delete-button">Delete</button>`, 
        sortable: false, 
        filter: false 
    },
];

const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 100,
};

const checkrole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        if (decoded.user.role === 'admin') {
            isAdmin.value = true;
        }
        if (decoded.user.role === 'student') {
            isStudent.value = true;
            student_id.value = decoded.user.student_id;
            await fetchStudentRegisteredEvents();
        }
    }
};

async function fetchEventDetails() {
    const eventId = route.params.id;
    try {
        const response = await fetch('/api/event/detail/' + eventId);
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
    } catch (error) {
        errorMessage.value = 'Error fetching event details: ' + error.message;
    } finally {
        loading.value = false;
    }
}

async function fetchRegisteredEvents() {
    const eventId = route.params.id;
    try {
        const response = await fetch(`/api/admincheckregistrations/` + eventId);
        const registrationData = await response.json();
        transformedEvents.value = registrationData.map(student => ({
            student_id: student.student_id,
            event_id: student.event_id,
            attendance: student.attendance !== undefined ? (student.attendance ? 'Present' : 'Absent') : 'N/A',
            paymentMethod: student.paymentMethod !== undefined ? student.paymentMethod : 'Free',
        }));
     
    } catch (error) {
        errorMessage.value = 'Error fetching registered events: ' + error.message;
    }
}
async function fetchRegistrationCount() {
    const eventId = route.params.id;
    try {
        const response = await fetch(`/api/admincheckregistrations/${eventId}/count`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        registrationCount.value =  data.totalRegistrations; // Returns the count (number)
        console.log(registrationCount.value);
    } catch (error) {
        console.error('Error fetching registration count:', error);
        // Handle error (show message, return 0, etc.)
        errorMessage.value = 'Failed to load registration count: ' + error.message;
        return 0; // Fallback value
    }
}

async function fetchStudentRegisteredEvents() {
    try {
        const response = await fetch(`/api/registrations/` + student_id.value);
        const registrationData = await response.json();
        registrationData.forEach(event => {
            if (event.event_id) {
                registeredEvents.value.add(event.event_id);
            }
        });
    } catch (error) {
        errorMessage.value = 'Error fetching registered events: ' + error.message;
    }
}

const isEventRegistered = (id) => {
    return registeredEvents.value.has(id);
};

const cancelRegistration = async (eventId) => {
    try {
        await axios.delete(`/api/registrations/${student_id.value}/${eventId}`);
        registeredEvents.value.delete(eventId);
        alert('Registration canceled successfully.');
        fetchStudentRegisteredEvents();
    } catch (error) {
        errorMessage.value = 'Error canceling registration: ' + error.message;
    }
};
const deleteRegistration = async (eventId, studentId) => {
    try {
        await axios.delete(`/api/registrations/${studentId}/${eventId}`); // Pass both studentId and eventId
        alert('Registration deleted successfully.');
        fetchRegisteredEvents(); // Refresh the grid data
    } catch (error) {
        errorMessage.value = 'Error deleting registration: ' + error.message;
    }
};

const confirmDelete = (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
        deleteEvent(eventId);
    }
};

const stopRegistration = async (eventId) => {
    try {
        await axios.patch(`/api/event/${eventId}/canRegister`, { canRegister: false });
        alert('Registration has been stopped successfully.');
        // Optionally, you can refresh event details or navigate to a different page
        fetchEventDetails(); // Refresh the event details
    } catch (error) {
        errorMessage.value = 'Error stopping registration: ' + error.message;
    }
};


const resumeRegistration = async (eventId) => {
    try {
        await axios.patch(`/api/event/${eventId}/canRegister`, { canRegister: true });
        alert('Registration has been resumed successfully.');
        fetchEventDetails(); // Refresh the event details
    } catch (error) {
        errorMessage.value = 'Error resuming registration: ' + error.message;
    }
};

const deleteEvent = async (eventId) => {
    try {
        await axios.delete(`/api/event/${eventId}`);
        router.push('/event');
    } catch (error) {
        errorMessage.value = 'Error deleting event: ' + error.message;
    }
};

const onRowClickedMember = (event) => {
    // Check if the target is a button with a specific class
    if (event.event.target.classList.contains('confirm-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const id = event.data.event_id; // Get the event ID from the row data
        confirmRegistration(id); // Call the confirm function
    } else if (event.event.target.classList.contains('delete-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const studentId = event.data.student_id; // Get the student ID from the row data
        const eventId = event.data.event_id; // Get the event ID from the row data
        deleteRegistration(eventId, studentId); // Call the delete function
    } else {
        const recordId = event.data.student_id; // Get the student ID from the row data
        router.push(`/memberdetail/${recordId}`); // Navigate to the member detail page
    }
};


onMounted(() => {
    checkrole();
    fetchEventDetails();
    fetchRegisteredEvents();
    fetchRegistrationCount();
});
</script>

<style scoped>
.event-detail {
    padding: 20px;
}

.event-image {
    max-width: 100%;
    height: auto;
}

.alert {
    margin-top: 20px;
}
</style>
