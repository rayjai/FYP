<script setup>
import Header from '@/components/Header.vue';
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import { AgGridVue } from "ag-grid-vue3"; // Import ag-grid-vue
import '@/assets/css/event.css'
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import toastr from 'toastr';
import '@/assets/css/style.css'



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
const username = ref("");
const errorMessagefin = ref(''); // Reactive error message

const club = ref({
    code: '',
    category: ''
});

const handleSubmit = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    errorMessagefin.value = ''; // Reset error message
    try {
        const response = await axios.post(`/api/finance_category`, {
            code: club.value.code,
            category: club.value.category,
            clubId: clubId
        });
        closeFormModal();
        if (response.status === 200) {
            localStorage.setItem('toastrMessage', 'Finance Category added successfully!');
        }
        fetchCategories();

    } catch (error) {
        console.error('Error setting category info:', error);
        if (error.response && error.response.status === 409) {
            errorMessagefin.value = 'Code/Name has already existed.'; // Set error message for duplicates
        } 
    }
};

function openFormModal() {
    document.getElementById("FormModal").style.display = "block";
}

function closeFormModal() {
    document.getElementById("FormModal").style.display = "none";
    errorMessagefin.value = ''; // Reset error message when closing modal
}

const loadAsyncData = async () => {
  try {
    // Get the token from local storage    
    const token = localStorage.getItem('token');


    const decoded = jwtDecode(token);
    username.value = `${decoded.user.english_name} `;
  } catch (error) {
    console.log(error);
  }
};

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
        headerName: "Payment Status", 
        field: "confirm", 
        sortable: true, 
        filter: true,
        valueGetter: params => params.data.confirm ? "Confirmed" : "Not Confirmed" // Convert boolean to string
    },
    { 
        headerName: "", 
        cellRenderer: params => `<button class="confirm-button btn btn-success" ${params.data.confirm ? 'disabled' : ''}>Confirm</button>`, 
        sortable: false, 
        filter: false 
    },
    { 
        headerName: "", 
        cellRenderer: params => `<button class="delete-button btn btn-danger">Delete</button>`, 
        sortable: false, 
        filter: false 
    },
    { 
        headerName: "ID", // You can give it a name, but it won't be shown
        field: "_id", 
        hide: true // This will hide the column from the grid
    }
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
            paymentMethod: student.paymentMethod !== '' ? student.paymentMethod : 'Free',
            confirm: student.confirm != undefined ? student.confirm : 'N/A',
            _id: student._id // Ensure this is included

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
        localStorage.setItem('toastrMessage', 'Registration cancelled successfully!');
        fetchStudentRegisteredEvents();
    } catch (error) {
        errorMessage.value = 'Error canceling registration: ' + error.message;
    }
};
const deleteRegistration = async (eventId, studentId) => {
    try {
        await axios.delete(`/api/registrations/${studentId}/${eventId}`); // Pass both studentId and eventId
        localStorage.setItem('toastrMessage', 'Registration deleted successfully!');
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
        localStorage.setItem('toastrMessage', 'Registration has been stopped successfully.');
        // Optionally, you can refresh event details or navigate to a different page
        fetchEventDetails(); // Refresh the event details
    } catch (error) {
        errorMessage.value = 'Error stopping registration: ' + error.message;
    }
};


const resumeRegistration = async (eventId) => {
    try {
        await axios.patch(`/api/event/${eventId}/canRegister`, { canRegister: true });
        localStorage.setItem('toastrMessage', 'Registration has been resumed successfully.');
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

const student_id_full = ref("");
const user_data = ref([]);
const fetchStudentIdFull = async (student_id) => {
    try {
        const response = await axios.get('/api/user/detail/'+ student_id); // Adjust the endpoint as necessary
        user_data.value = response.data; // Assuming the response contains an array of categories
        console.log(response.data);
        student_id_full.value= user_data.value._id;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};
const onRowClickedMember = async (event) => {
    // Check if the target is a button with a specific class
    if (event.event.target.classList.contains('confirm-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const id = event.data; // Get the event ID from the row data
        console.log(id);
        confirmRegistration(id); // Call the confirm function
    } else if (event.event.target.classList.contains('delete-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const studentId = event.data.student_id; // Get the student ID from the row data
        const eventId = event.data.event_id; // Get the event ID from the row data
        deleteRegistration(eventId, studentId); // Call the delete function
    } else {
        const recordId = event.data.student_id; // Get the student ID from the row data
        await fetchStudentIdFull(recordId); // Wait for the fetch to complete
        router.push(`/event/registration/detail/${event.data._id}`); // Navigate to the member detail page
    }
};

const categoryWarning = ref(""); // Step 1: Warning message for category selection


const chooseCategory =ref("");
const feeItems = ref([{ feeItem: 'Event', itemName: event.value.eventName, quantity: 1, unitPrice: event.value.eventPrice, discount: 0, amount: event.value.eventPrice }]);

const confirmRegistration = async (thisrecord) => {
    if (!chooseCategory.value) {
        categoryWarning.value = "Please select a category before confirming."; // Set the warning message
        return; // Exit the function if no category is selected
    } else {
        categoryWarning.value = ""; // Clear the warning if a category is selected
    }

    // Get the current date
    const currentDate = new Date().toISOString(); // Format as ISO string
    const unitPrice = parseFloat(event.value.eventPrice);
    const feeItems = ref([{ feeItem: 'Event', itemName: event.value.eventName, quantity: 1, unitPrice: unitPrice, discount: 0, amount: unitPrice }]);

    const recordData = {
        title: event.value.eventName,
        date: event.value.eventDateFrom,
        category: chooseCategory.value, // Ensure chooseCategory is defined in your script
        personInCharge: username.value,
        feeItems: feeItems.value, // Ensure feeItems is defined in your script
        remarks: '',
        createReceipt: true,
        issueDate: currentDate,
        billTo: thisrecord.student_id, // Use the student_id from the clicked row
        totalAmount: unitPrice,
    };

    try {
        const response = await fetch('/api/income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData),
        });

        if (!response.ok) {
            throw new Error('Failed to save income record');
        }

        const result = await response.json();
        // Before redirecting
        localStorage.setItem('toastrMessage', 'Payment Confirmed and Income record added successfully!');
        await updateRegistrationStatus(thisrecord._id, true);
        fetchRegisteredEvents(); // Refresh the registered events

    } catch (error) {
        console.error('Error saving income record:', error);
        // Optionally, show an error message to the user
    }
};

const updateRegistrationStatus = async (Id, confirmValue) => {
    try {
        const response = await fetch(`/api/registerEvents/${Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ confirm: confirmValue }), // Update the confirm value
        });

        if (!response.ok) {
            throw new Error('Failed to update registration status');
        }

        const result = await response.json();
        console.log('Registration status updated successfully:', result);
    } catch (error) {
        console.error('Error updating registration status:', error);
    }
};

// On the dashboard page
function displayToastrMessage() {
    const message = localStorage.getItem('toastrMessage');
    if (message) {
        toastr.success(message);
        localStorage.removeItem('toastrMessage'); // Clear the message after displaying
    }
}

// Call the function every second (1000 milliseconds)
setInterval(displayToastrMessage, 1000);

const categories = ref([]); 
// Fetch categories from the database
const fetchCategories = async () => {
    try {
        const response = await axios.get('/api/finance_category'); // Adjust the endpoint as necessary
        categories.value = response.data; // Assuming the response contains an array of categories
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

onMounted(() => {
    checkrole();
    loadAsyncData();
    fetchEventDetails();
    fetchRegisteredEvents();
    fetchRegistrationCount();
    fetchCategories();
});
</script>

<template>
    <Header />
    <div class="header-spacer"></div>

    <div class="event-container">
        <!-- Event Header Section -->
        <div class="event-header">
            <div class="event-poster-container">
                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" alt="Event Image" class="event-poster" />
            </div>
            <div class="event-meta">
                <h1 class="event-title">{{ event.eventName }}</h1>
                <div class="event-details-grid">
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span v-if="event.eventDateFrom === event.eventDateTo">
                            {{ event.eventDateFrom }}
                        </span>
                        <span v-else>
                            {{ event.eventDateFrom }} - {{ event.eventDateTo }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">⏰</span>
                        {{ event.eventTimeStart}} - {{ event.eventTimeEnd }}
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">💰</span>
                        <span v-if='event.eventType === "free"'>Free</span>
                        <span v-else>HK${{ event.eventPrice }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📍</span>
                        {{ event.eventVenue }}
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">⏳</span>
                        Registration Deadline: {{ event.deadline }}
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">👥</span>
                        Registrations: {{ registrationCount }}/{{ event.totalmaxRegistration }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Event Description -->
        <div class="event-description">
            <h2>About the Event</h2>
            <p>{{ event.eventDescription }}</p>
        </div>

        <!-- Admin Controls -->
        <div v-if="isAdmin" class="admin-controls">
            <h2>Event Management</h2>
            <div class="action-buttons">
                <router-link :to="'/event/edit/' + event._id" class="btn btn-edit">
                    <i class='bx bx-edit'></i> Edit Event
                </router-link>
                <div v-if="new Date(event.eventDateFrom) > new Date()">
                    <router-link :to="'/eventregister/' + event._id" class="btn btn-register">
                        <i class='bx bx-user-plus'></i> Register Members
                    </router-link>
                </div>
                <router-link 
    :to="'/qrcodescan/' + event._id" 
    class="btn btn-scan"
    title="Scan attendance"
    @click.stop
>
    <i class='bx bx-qr-scan'></i> Take Attendance
</router-link>
                <button @click="confirmDelete(event._id)" class="btn btn-delete">
                    <i class='bx bx-trash'></i> Delete Event
                </button>
                <button @click="stopRegistration(event._id)" class="btn btn-warning" v-if="event.canRegister">
                    <i class='bx bx-stop-circle'></i> Stop Registration
                </button>
                <button @click="resumeRegistration(event._id)" class="btn btn-success" v-if="!event.canRegister">
                    <i class='bx bx-play-circle'></i> Resume Registration
                </button>
            </div>

            <!-- Registration Management -->
            <div class="registration-management">
                <h3>Registered Members</h3>
                <div class="payment-controls">
                    <div class="form-group">
                        <label for="category">Select Payment Category</label>
                        <select id="category" v-model="chooseCategory" required class="form-select">
                            <option value="" disabled>Select a category</option>
                            <option v-for="category in categories" :key="category._id" :value="category.category">
                                {{ category.code + ' - ' + category.category }}
                            </option>
                        </select>
                        <p v-if="categoryWarning" class="warning-message">{{ categoryWarning }}</p>
                    </div>
                    <button class="btn btn-add-category" @click="openFormModal" style="margin: auto;">
                        <i class='bx bx-plus'></i> Add Finance Category
                    </button>
                </div>
                
                <div class="ag-grid-container">
                    <ag-grid-vue
                        class="ag-theme-alpine-dark"
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
        </div>

        <!-- Student Controls -->
        <div v-else-if="isStudent" class="student-controls">
            <div v-if="isEventRegistered(event._id)" class="registration-status">
                <span class="registered-badge">
                    <i class='bx bx-check-circle'></i> Registered
                </span>
                <button v-if="new Date(event.deadline) > new Date()" @click="cancelRegistration(event._id)" class="btn btn-cancel">
                    <i class='bx bx-x'></i> Cancel Registration
                </button>
            </div>
            <div v-else>
                <div v-if="new Date(event.deadline) > new Date()" class="register-action">
                    <router-link :to="'/eventregister/' + event._id" class="btn btn-primary">
                        <i class='bx bx-edit-alt'></i> Register Now
                    </router-link>
                </div>
                <div v-else class="registration-closed">
                    <i class='bx bx-time'></i> Registration Closed
                </div>
            </div>
        </div>

        <!-- Guest Controls -->
        <div v-else class="guest-controls">
            <div v-if="new Date(event.deadline) > new Date()" class="register-action">
                <router-link :to="'/signup'" class="btn btn-primary">
                    <i class='bx bx-user-plus'></i> Sign Up to Register
                </router-link>
            </div>
            <div v-else class="registration-closed">
                <i class='bx bx-time'></i> Registration Closed
            </div>
        </div>
    </div>

    <!-- Finance Category Modal -->
    <div id="FormModal" class="modal">
        <div class="modal-content">
            <span class="close" @click="closeFormModal">&times;</span>
            <h2><i class='bx bx-dollar-circle'></i> Add Finance Category</h2>

            <div v-if="errorMessagefin" class="error-message">
                <i class='bx bx-error'></i> {{ errorMessagefin }}
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="code"><i class='bx bx-code'></i> Code</label>
                    <input type="text" id="code" v-model="club.code" class="form-input" placeholder="Enter category code" />
                </div>
                <div class="form-group">
                    <label for="category"><i class='bx bx-category'></i> Category Name</label>
                    <input type="text" id="category" v-model="club.category" class="form-input" placeholder="Enter category name" />
                </div>
                <div class="form-actions">
                    <button type="button" @click="closeFormModal" class="btn btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-submit">
                        <i class='bx bx-save'></i> Save Category
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>


<style scoped>
/* Base Styles */
.event-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #2d3748;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header-spacer {
    height: 80px;
}

/* Event Header */
.event-header {
    display: flex;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
    align-items: flex-start;
}

.event-poster-container {
    flex: 0 0 40%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.event-poster-container:hover {
    transform: translateY(-5px);
}

.event-poster {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
}

.event-meta {
    flex: 1;
}

.event-title {
    font-size: 2.4rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-weight: 700;
    line-height: 1.2;
}

.event-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.1rem;
    padding: 0.8rem 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #3498db;
}

.detail-icon {
    font-size: 1.3rem;
    color: #3498db;
}

/* Event Description */
.event-description {
    margin: 2.5rem 0;
    padding: 1.8rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #edf2f7;
}

.event-description h2 {
    color: #2c3e50;
    margin-bottom: 1.2rem;
    font-size: 1.8rem;
    border-bottom: 2px solid #f0f4f8;
    padding-bottom: 0.6rem;
}

.event-description p {
    line-height: 1.7;
    font-size: 1.1rem;
    color: #4a5568;
}

/* Admin Controls */
.admin-controls {
    margin-top: 3rem;
    padding: 2rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.admin-controls h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.6rem;
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-edit {
    background-color: #4299e1;
    color: white;
}

.btn-edit:hover {
    background-color: #3182ce;
}

.btn-register {
    background-color: #48bb78;
    color: white;
}

.btn-register:hover {
    background-color: #38a169;
}

.btn-delete {
    background-color: #f56565;
    color: white;
}

.btn-delete:hover {
    background-color: #e53e3e;
}

.btn-warning {
    background-color: #ed8936;
    color: white;
}

.btn-warning:hover {
    background-color: #dd6b20;
}

.btn-success {
    background-color: #48bb78;
    color: white;
}

.btn-success:hover {
    background-color: #38a169;
}

/* Registration Management */
.registration-management {
    margin-top: 2rem;
}

.registration-management h3 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
}

.payment-controls {
    display: flex;
    align-items: flex-end;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.form-group {
    flex: 1;
}

.form-select {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background-color: white;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
}

.warning-message {
    color: #e53e3e;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.btn-add-category {
    background-color: #667eea;
    color: white;
    padding: 0.8rem 1.2rem;
}

.btn-add-category:hover {
    background-color: #5a67d8;
}

.ag-grid-container {
    margin-top: 1.5rem;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Student Controls */
.student-controls {
    margin-top: 3rem;
    text-align: center;
}

.registration-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
}

.registered-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    background-color: #48bb78;
    color: white;
    border-radius: 8px;
    font-weight: 600;
}

.btn-cancel {
    background-color: #f56565;
    color: white;
}

.btn-cancel:hover {
    background-color: #e53e3e;
}

.register-action {
    margin-top: 1.5rem;
}

.btn-primary {
    background-color: #4299e1;
    color: white;
    padding: 1rem 2rem;
    font-size: 1.1rem;
}

.btn-primary:hover {
    background-color: #3182ce;
}

.registration-closed {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background-color: #edf2f7;
    color: #4a5568;
    border-radius: 8px;
    font-weight: 600;
}

/* Guest Controls */
.guest-controls {
    margin-top: 3rem;
    text-align: center;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1050;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 2.5rem;
    border-radius: 12px;
    width: 50%;
    max-width: 600px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    position: relative;
}

.close {
    position: absolute;
    right: 1.5rem;
    top: 1.5rem;
    font-size: 2rem;
    font-weight: bold;
    color: #a0aec0;
    cursor: pointer;
    transition: color 0.2s;
}

.close:hover {
    color: #718096;
}

.modal-content h2 {
    color: #2d3748;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.error-message {
    background-color: #fff5f5;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-left: 4px solid #e53e3e;
}

.form-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    margin-top: 0.5rem;
    transition: border-color 0.2s;
}

.form-input:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-submit {
    background-color: #48bb78;
    color: white;
}

.btn-submit:hover {
    background-color: #38a169;
}

/* Scan Attendance Button */
.btn-scan {
    background-color: #6b46c1;
    color: white;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    border: none;
}

.btn-scan:hover {
    background-color: #553c9a;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(107, 70, 193, 0.3);
}

.btn-scan i {
    font-size: 1.2rem;
}
/* Responsive Design */
@media (max-width: 992px) {
    .event-header {
        flex-direction: column;
    }
    
    .event-poster-container {
        width: 100%;
    }
    
    .modal-content {
        width: 80%;
    }
}

@media (max-width: 768px) {
    .event-details-grid {
        grid-template-columns: 1fr;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .payment-controls {
        flex-direction: column;
        align-items: stretch;
    }
    
    .modal-content {
        width: 90%;
        padding: 1.5rem;
    }
}

@media (max-width: 576px) {
    .event-container {
        padding: 1rem;
    }
    
    .event-title {
        font-size: 1.8rem;
    }
    
    .registration-status {
        flex-direction: column;
        gap: 1rem;
    }
}
/* AG-Grid Button Styles */
.ag-theme-alpine-dark .ag-cell button {
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Confirm Button */
.ag-theme-alpine-dark .ag-cell .confirm-button {
    background-color: #48bb78;
    color: white;
    border: 1px solid #38a169;
}

.ag-theme-alpine-dark .ag-cell .confirm-button:hover:not(:disabled) {
    background-color: #38a169;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(72, 187, 120, 0.3);
}

.ag-theme-alpine-dark .ag-cell .confirm-button:disabled {
    background-color: #a0aec0;
    border-color: #718096;
    cursor: not-allowed;
    opacity: 0.7;
}

/* Delete Button */
.ag-theme-alpine-dark .ag-cell .delete-button {
    background-color: #f56565;
    color: white;
    border: 1px solid #e53e3e;
}

.ag-theme-alpine-dark .ag-cell .delete-button:hover {
    background-color: #e53e3e;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(245, 101, 101, 0.3);
}

/* Button Icons */
.ag-theme-alpine-dark .ag-cell button i {
    font-size: 1rem;
}

/* Button Container Cells */
.ag-theme-alpine-dark .ag-cell[col-id="5"],
.ag-theme-alpine-dark .ag-cell[col-id="6"] {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
}

/* Hover Effects for Rows with Buttons */
.ag-theme-alpine-dark .ag-row:hover .confirm-button:not(:disabled),
.ag-theme-alpine-dark .ag-row:hover .delete-button {
    transform: scale(1.05);
}

/* Button Focus States */
.ag-theme-alpine-dark .ag-cell button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}
</style>