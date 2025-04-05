<template>
    <main class="event-edit-page">
        <Header />
        <div class="header-spacer"></div>

        <div v-if="isAdmin">
            <div class="edit-container">
                <div class="edit-card">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        <a href="/event" class="return-link">
                            <i class='bx bx-arrow-back'></i> Back to Events
                        </a>
                    </div>
                    
                    <h2 class="edit-title">Edit Event</h2>
                    
                    <form @submit.prevent="handleSubmit" class="edit-form">
                        <div class="form-grid">
                            <!-- Basic Event Info -->
                            <div class="form-section">
                                <h3 class="section-title">Basic Information</h3>
                                <div class="form-group">
                                    <label for="event-name">Event Name</label>
                                    <input type="text" id="event-name" v-model="event.eventName" required>
                                </div>
                                
                                <div class="form-row date-inputs-container">
    <div class="form-group">
        <label for="event-date-from">Start Date</label>
        <input type="date" id="event-date-from" :min="minDate" 
               v-model="event.eventDateFrom" required
               @change="validateDates">
        <span class="error-message" v-if="dateErrors.startDate">{{ dateErrors.startDate }}</span>
    </div>
    <div class="form-group">
        <label for="event-date-to">End Date</label>
        <input type="date" id="event-date-to" :min="eventDateFrom || minDate" 
               v-model="event.eventDateTo" required
               @change="validateDates">
        <span class="error-message" v-if="dateErrors.endDate">{{ dateErrors.endDate }}</span>
    </div>
</div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="event-time-start">Start Time</label>
                                        <input type="time" id="event-time-start" v-model="event.eventTimeStart" required
                                               @change="validateTimes">
                                        <span class="error-message" v-if="timeErrors.startTime">{{ timeErrors.startTime }}</span>
                                    </div>
                                    <div class="form-group">
                                        <label for="event-time-end">End Time</label>
                                        <input type="time" id="event-time-end" v-model="event.eventTimeEnd" required
                                               @change="validateTimes">
                                        <span class="error-message" v-if="timeErrors.endTime">{{ timeErrors.endTime }}</span>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="venue">Venue</label>
                                    <input type="text" id="venue" v-model="event.eventVenue" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="deadline">Registration Deadline</label>
                                    <input type="date" id="deadline" :min="minDate" 
                                           v-model="event.deadline" required
                                           @change="validateDeadline">
                                    <span class="error-message" v-if="dateErrors.deadline">{{ dateErrors.deadline }}</span>
                                </div>
                            </div>
                            
                            <!-- Event Details -->
                            <div class="form-section">
                                <h3 class="section-title">Event Details</h3>
                                <div class="form-group">
                                    <label for="event-type">Event Type</label>
                                    <select id="event-type" v-model="event.eventType" required>
                                        <option value="free">Free</option>
                                        <option value="charged">Charged</option>
                                    </select>
                                </div>
                                
                                <div class="form-group" v-if="event.eventType === 'charged'">
                                    <label for="event-price">Event Price </label>
                                    <input type="number" id="event-price" 
                                           v-model="event.eventPrice" required min="0" step="0.01">
                                </div>
                                
                                <div class="form-group">
                                    <label for="event-description">Description</label>
                                    <textarea id="event-description" v-model="event.eventDescription"
                                              rows="4" required></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="max-registration">Maximum Registrations</label>
                                    <input type="number" id="max-registration" v-model="event.totalmaxRegistration" 
                                           required min="1">
                                </div>
                                
                                <div class="form-group">
                                    <label for="multiple-section">Multiple Sections?</label>
                                    <select id="multiple-section" v-model="event.multipleSection" 
                                            @change="handleSectionChange" required>
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Event Media -->
                            <div class="form-section">
                                <h3 class="section-title">Event Media</h3>
                                <div class="form-group">
                                    <label>Current Poster</label>
                                    <div v-if="event.eventPoster" class="poster-preview">
                                        <img :src="'http://localhost:3000/uploads/' + event.eventPoster" 
                                             alt="Current Event Poster" />
                                    </div>
                                    <div v-else class="no-poster">
                                        <i class='bx bx-image-alt'></i>
                                        <p>No poster uploaded</p>
                                    </div>
                                </div>
                                
                                <div class="form-group file-upload">
                                    <label for="event-poster">Update Poster</label>
                                    <div class="upload-area" @click="$refs.fileInput.click()">
                                        <input type="file" id="eventPoster" ref="fileInput" 
                                               accept=".pdf,.png,.jpg,.jpeg" @change="handleFileChange" hidden>
                                        <div v-if="!event.poster" class="upload-placeholder">
                                            <i class='bx bx-cloud-upload'></i>
                                            <p>Click to upload new poster</p>
                                            <small>Accepted formats: PDF, PNG, JPG (Max 5MB)</small>
                                        </div>
                                        <div v-else class="file-preview">
                                            <i class='bx bx-check-circle'></i>
                                            <p>{{ event.poster.name }}</p>
                                            <button type="button" @click.stop="event.poster = null" class="remove-file">
                                                <i class='bx bx-x'></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Sections (Conditional) -->
                        <div v-if="event.multipleSection === 'yes'" class="sections-container">
        <div class="section-header">
            <h3 class="section-title">Event Sections</h3>
            <div class="form-group section-count">
                <label for="section-select">Number of Sections</label>
                <select v-model="event.sectionNumber" id="section-select" 
                        @change="updateSections" required>
                    <option v-for="num in 10" :key="num" :value="num">{{ num }}</option>
                </select>
            </div>
        </div>
        
        <div v-for="(section, index) in event.sections" :key="index" class="section-card">
            <h4>Section {{ index + 1 }}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label :for="'section-name-' + index">Section Name</label>
                    <input type="text" :id="'section-name-' + index" v-model="section.name" 
                           placeholder="Enter section name" required>
                </div>
                <div class="form-group">
                    <label :for="'max-registration-' + index">Max Registrations</label>
                    <input type="number" :id="'max-registration-' + index" 
                           v-model.number="section.maxRegistration" 
                           @input="validateSectionRegistrations"
                           placeholder="Enter max registrations" required min="1">
                </div>
            </div>
        </div>
        
        <div class="registration-error" v-if="registrationError">
            <i class='bx bx-error'></i>
            <span>{{ registrationError }}</span>
        </div>
    </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="submit-btn" :disabled="isLoading">
                                <i class='bx bx-save'></i> 
                                <span v-if="!isLoading">Update Event</span>
                                <span v-else class="loading-spinner">Updating...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed,watch } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

const route = useRoute();
const isAdmin = ref(false);
const isLoading = ref(false);
const event = ref({
    eventName: '',
    eventDateFrom: '',
    eventDateTo: '',
    eventTimeStart: '',
    eventTimeEnd: '',
    eventVenue: '',
    deadline: '',
    eventType: 'free',
    eventPrice: 0,
    eventPoster: null,
    poster: null,
    eventDescription: '',
    multipleSection: 'no',
    totalmaxRegistration: null,
    sectionNumber: 0,
    sections: [{ name: '', maxRegistration: null }]
});

const dateErrors = ref({
    startDate: '',
    endDate: '',
    deadline: ''
});

const timeErrors = ref({
    startTime: '',
    endTime: ''
});

// Get today's date in YYYY-MM-DD format
const today = new Date();
const minDate = computed(() => today.toISOString().split('T')[0]);

const checkrole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        isAdmin.value = decoded.user.role === 'admin';
    }
}

const fetchEvent = async () => {
    try {
        const response = await axios.get(`/api/event/detail/${route.params.id}`);
        event.value = {
            ...response.data,
            sections: response.data.sections || []
        };
        
        if (event.value.multipleSection === 'yes' && event.value.sections.length < event.value.sectionNumber) {
            const neededSections = event.value.sectionNumber - event.value.sections.length;
            for (let i = 0; i < neededSections; i++) {
                event.value.sections.push({ name: '', maxRegistration: null });
            }
        }
    } catch (error) {
        console.error('Error fetching event:', error);
    }
}

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PDF, JPG, or PNG file');
            e.target.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            e.target.value = '';
            return;
        }
        
        event.value.poster = file;
    }
};


const updateSections = () => {
    const currentLength = event.value.sections.length;
    const newLength = parseInt(event.value.sectionNumber);
    
    if (newLength > currentLength) {
        for (let i = currentLength; i < newLength; i++) {
            event.value.sections.push({ name: '', maxRegistration: null });
        }
    } else if (newLength < currentLength) {
        event.value.sections = event.value.sections.slice(0, newLength);
    }
    
    validateSectionRegistrations();
};

const handleSectionChange = () => {
    if (event.value.multipleSection === 'no') {
        event.value.sections = [{ name: '', maxRegistration: null }];
        event.value.sectionNumber = 0;
    } else {
        event.value.sectionNumber = 1;
        if (event.value.sections.length === 0) {
            event.value.sections = [{ name: '', maxRegistration: null }];
        }
    }
};

const validateDates = () => {
    dateErrors.value.startDate = '';
    dateErrors.value.endDate = '';
    
    if (!event.value.eventDateFrom || !event.value.eventDateTo) return;
    
    const startDate = new Date(event.value.eventDateFrom);
    const endDate = new Date(event.value.eventDateTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
        dateErrors.value.startDate = 'Start date must be in the future';
    }
    
    if (endDate < startDate) {
        dateErrors.value.endDate = 'End date cannot be before start date';
    }
    
    if (event.value.eventDateFrom === event.value.eventDateTo) {
        validateTimes();
    }
};

const validateTimes = () => {
    timeErrors.value.startTime = '';
    timeErrors.value.endTime = '';
    
    if (!event.value.eventTimeStart || !event.value.eventTimeEnd) return;
    
    if (event.value.eventDateFrom === event.value.eventDateTo) {
        const startTime = new Date(`2000-01-01T${event.value.eventTimeStart}`);
        const endTime = new Date(`2000-01-01T${event.value.eventTimeEnd}`);
        
        if (endTime <= startTime) {
            timeErrors.value.endTime = 'End time must be after start time';
        }
    }
    
    if (event.value.eventDateFrom === minDate.value) {
        const now = new Date();
        const [hours, minutes] = event.value.eventTimeStart.split(':');
        const eventTime = new Date();
        eventTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (eventTime < now) {
            timeErrors.value.startTime = 'Start time must be in the future';
        }
    }
};

const validateDeadline = () => {
    dateErrors.value.deadline = '';
    
    if (!event.value.deadline) return;
    
    const deadline = new Date(event.value.deadline);
    const startDate = new Date(event.value.eventDateFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadline < today) {
        dateErrors.value.deadline = 'Deadline must be in the future';
    }
    
    if (startDate && deadline > startDate) {
        dateErrors.value.deadline = 'Deadline cannot be after event start date';
    }
};

const validateForm = () => {
    validateDates();
    validateTimes();
    validateDeadline();
    
    const hasDateErrors = Object.values(dateErrors.value).some(error => error !== '');
    const hasTimeErrors = Object.values(timeErrors.value).some(error => error !== '');
    
    if (hasDateErrors || hasTimeErrors) {
        return false;
    }
    
    if (!event.value.eventName || !event.value.eventVenue || !event.value.eventDescription) {
        alert('Please fill in all required fields');
        return false;
    }

    if (event.value.multipleSection === 'yes') {
        if (!event.value.totalmaxRegistration) {
            alert('Please enter maximum registrations');
            return false;
        }

        for (const section of event.value.sections) {
            if (!section.name || !section.maxRegistration) {
                alert('Please fill in all section details');
                return false;
            }
        }

        const totalSectionMax = event.value.sections.reduce((sum, section) => sum + parseInt(section.maxRegistration), 0);
        if (totalSectionMax !== parseInt(event.value.totalmaxRegistration)) {
            alert(`Total section registrations (${totalSectionMax}) must match overall maximum (${event.value.totalmaxRegistration})`);
            return false;
        }
    }
    if (event.value.multipleSection === 'yes') {
        validateSectionRegistrations();
        if (registrationError.value) {
            return false;
        }
    }

    return true;
};

const handleSubmit = async () => {
    if (!validateForm()) return;
    
    isLoading.value = true;
    
    try {
        const formData = new FormData();
        formData.append('eventName', event.value.eventName);
        formData.append('eventDateFrom', event.value.eventDateFrom);
        formData.append('eventDateTo', event.value.eventDateTo);
        formData.append('eventTimeStart', event.value.eventTimeStart);
        formData.append('eventTimeEnd', event.value.eventTimeEnd);
        formData.append('eventVenue', event.value.eventVenue);
        formData.append('deadline', event.value.deadline);
        formData.append('eventType', event.value.eventType);
        formData.append('eventPrice', event.value.eventType === 'charged' ? event.value.eventPrice : 0);
        formData.append('eventDescription', event.value.eventDescription);
        formData.append('multipleSection', event.value.multipleSection);
        formData.append('totalmaxRegistration', event.value.totalmaxRegistration);
        
        if (event.value.poster) {
            formData.append('eventPoster', event.value.poster);
        }

        if (event.value.multipleSection === 'yes') {
            formData.append('sectionNumber', event.value.sectionNumber);
            formData.append('sections', JSON.stringify(event.value.sections));
        }

        const response = await axios.put(`/api/event/${route.params.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 200) {
            localStorage.setItem('toastrMessage', 'Event updated successfully!');
            window.location.href = '/event';
        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
    } finally {
        isLoading.value = false;
    }
};
const registrationError = ref('');

const validateSectionRegistrations = () => {
    registrationError.value = '';
    
    if (event.value.multipleSection === 'yes') {
        const totalSectionMax = event.value.sections.reduce(
            (sum, section) => sum + (parseInt(section.maxRegistration) || 0), 
            0
        );
        
        const totalMax = parseInt(event.value.totalmaxRegistration) || 0;
        
        if (totalSectionMax !== totalMax) {
            registrationError.value = 
                `Total section registrations (${totalSectionMax}) must equal overall maximum (${totalMax})`;
        }
    }
};


onMounted(() => {
    checkrole();
    fetchEvent();
});
watch(() => event.value.totalmaxRegistration, validateSectionRegistrations);
</script>

<style scoped>
.event-edit-page {
    background-color: #f5f7fa;
    min-height: 100vh;
}

.header-spacer {
    height: 80px;
}

.edit-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.edit-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2.5rem;
}

.return-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #4a6fa5;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 1.5rem;
}

.return-link i {
    font-size: 1.2rem;
}

.edit-title {
    color: #2c3e50;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 600;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.form-section {
    background: #f9fafc;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e1e5eb;
}

.section-title {
    color: #3a5a8f;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 2px solid #e1e5eb;
    padding-bottom: 0.5rem;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    border-color: #4a6fa5;
    box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.1);
    outline: none;
}

.form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap; /* Allow items to wrap on smaller screens */
}

.form-row .form-group {
    flex: 1;
    min-width: 0; /* Prevent flex items from growing beyond container */
}

/* Specifically target date inputs to ensure they fit */
input[type="date"] {
    width: 100%;
    box-sizing: border-box; /* Include padding in width calculation */
    max-width: 100%; /* Prevent overflow */
}

/* For the date inputs container */
.date-inputs-container {
    display: flex;
    gap: 1rem;
    width: 100%;
}


.error-message {
    display: block;
    color: #e53e3e;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    height: 1rem;
}

.form-group input:invalid, 
.form-group input.error {
    border-color: #e53e3e;
}

.form-group input:invalid:focus, 
.form-group input.error:focus {
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.poster-preview {
    margin-top: 0.5rem;
}

.poster-preview img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

.no-poster {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
    color: #a0aec0;
}

.no-poster i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.file-upload .upload-area {
    border: 2px dashed #e2e8f0;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.file-upload .upload-area:hover {
    border-color: #4a6fa5;
    background-color: rgba(74, 111, 165, 0.05);
}

.upload-placeholder i {
    font-size: 2rem;
    color: #a0aec0;
    margin-bottom: 0.5rem;
}

.upload-placeholder p {
    margin: 0.5rem 0;
    color: #4a5568;
}

.upload-placeholder small {
    color: #a0aec0;
    font-size: 0.8rem;
}

.file-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #38a169;
}

.file-preview i {
    font-size: 1.5rem;
}

.file-preview p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.remove-file {
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    font-size: 1.2rem;
}

.sections-container {
    background: #f9fafc;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e1e5eb;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-count {
    width: 150px;
}

.section-card {
    background: white;
    padding: 1.25rem;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    margin-bottom: 1rem;
}

.section-card h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #4a5568;
}

.submit-btn {
    background-color: #4a6fa5;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    width: 100%;
    max-width: 200px;
    justify-content: center;
}

.submit-btn:hover:not(:disabled) {
    background-color: #3a5a8f;
    transform: translateY(-2px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: #3a5a8f;
}

.submit-btn i {
    font-size: 1.2rem;
}

.loading-spinner {
    display: inline-flex;
    align-items: center;
}

.loading-spinner::after {
    content: "";
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-left: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .edit-container {
        padding: 1rem;
    }
    
    .edit-card {
        padding: 1.5rem;
    }
    
    .form-row {
        flex-direction: column;
        gap: 0;
    }
    
    .form-row .form-group {
        width: 100%;
    }
    
    input[type="date"] {
        width: 100%;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .section-count {
        width: 100%;
    }
    
    .submit-btn {
        max-width: 100%;
    }
}
.registration-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #e53e3e;
    background-color: #fee2e2;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 1rem;
}

.registration-error i {
    font-size: 1.2rem;
}

.section-card {
    position: relative;
}

.section-card .form-group input[type="number"] {
    padding-right: 2rem;
}
/* Force Toastr colors */
.toast-success {
  background-color: #51a351 !important;
}
.toast-error {
  background-color: #bd362f !important;
}
.toast-info {
  background-color: #2f96b4 !important;
}
.toast-warning {
  background-color: #f89406 !important;
}
</style>