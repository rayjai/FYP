<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed, watch } from "vue";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

let isAdmin = ref(false);
let isStudent = ref(false);

// Form data
const eventName = ref('');
const eventDateFrom = ref('');
const eventDateTo = ref('');
const eventTimeStart = ref('');
const eventTimeEnd = ref('');
const eventDescription = ref('');
const eventVenue = ref('');
const deadline = ref('');
const eventType = ref('free');
const eventPrice = ref(0);
const eventPoster = ref(null);
const multipleSection = ref('no');
const totalmaxRegistration = ref(null);
const sectionNumber = ref(0);
const sections = ref([{ name: '', maxRegistration: null }]);
const isLoading = ref(false);

// Error tracking
const dateErrors = ref({
    startDate: '',
    endDate: '',
    deadline: ''
});

const timeErrors = ref({
    startTime: '',
    endTime: ''
});

const registrationError = ref('');

// Get today's date in YYYY-MM-DD format
const today = new Date();
const minDate = computed(() => today.toISOString().split('T')[0]);

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

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, JPG, or PNG file');
        event.target.value = '';
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
    }
    
    eventPoster.value = file;
};

const updateSections = () => {
    const currentLength = sections.value.length;
    const newLength = parseInt(sectionNumber.value);
    
    if (newLength > currentLength) {
        for (let i = currentLength; i < newLength; i++) {
            sections.value.push({ name: '', maxRegistration: null });
        }
    } else if (newLength < currentLength) {
        sections.value = sections.value.slice(0, newLength);
    }
    
    validateSectionRegistrations();
};

const handleSectionChange = () => {
    if (multipleSection.value === 'no') {
        sections.value = [{ name: '', maxRegistration: null }];
        sectionNumber.value = 0;
    } else {
        sectionNumber.value = 1;
        if (sections.value.length === 0) {
            sections.value = [{ name: '', maxRegistration: null }];
        }
    }
};

const validateDates = () => {
    dateErrors.value.startDate = '';
    dateErrors.value.endDate = '';
    
    if (!eventDateFrom.value || !eventDateTo.value) return;
    
    const startDate = new Date(eventDateFrom.value);
    const endDate = new Date(eventDateTo.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
        dateErrors.value.startDate = 'Start date must be in the future';
    }
    
    if (endDate < startDate) {
        dateErrors.value.endDate = 'End date cannot be before start date';
    }
    
    if (eventDateFrom.value === eventDateTo.value) {
        validateTimes();
    }
};

const validateTimes = () => {
    timeErrors.value.startTime = '';
    timeErrors.value.endTime = '';
    
    if (!eventTimeStart.value || !eventTimeEnd.value) return;
    
    if (eventDateFrom.value === eventDateTo.value) {
        const startTime = new Date(`2000-01-01T${eventTimeStart.value}`);
        const endTime = new Date(`2000-01-01T${eventTimeEnd.value}`);
        
        if (endTime <= startTime) {
            timeErrors.value.endTime = 'End time must be after start time';
        }
    }
    
    if (eventDateFrom.value === minDate.value) {
        const now = new Date();
        const [hours, minutes] = eventTimeStart.value.split(':');
        const eventTime = new Date();
        eventTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (eventTime < now) {
            timeErrors.value.startTime = 'Start time must be in the future';
        }
    }
};

const validateDeadline = () => {
    dateErrors.value.deadline = '';
    
    if (!deadline.value) return;
    
    const deadlineDate = new Date(deadline.value);
    const startDate = new Date(eventDateFrom.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
        dateErrors.value.deadline = 'Deadline must be in the future';
    }
    
    if (startDate && deadlineDate > startDate) {
        dateErrors.value.deadline = 'Deadline cannot be after event start date';
    }
};

const validateSectionRegistrations = () => {
    registrationError.value = '';
    
    if (multipleSection.value === 'yes') {
        const totalSectionMax = sections.value.reduce(
            (sum, section) => sum + (parseInt(section.maxRegistration) || 0), 
            0
        );
        
        const totalMax = parseInt(totalmaxRegistration.value) || 0;
        
        if (totalSectionMax !== totalMax) {
            registrationError.value = 
                `Total section registrations (${totalSectionMax}) must equal overall maximum (${totalMax})`;
        }
    }
};

const validateForm = () => {
    validateDates();
    validateTimes();
    validateDeadline();
    validateSectionRegistrations();
    
    const hasDateErrors = Object.values(dateErrors.value).some(error => error !== '');
    const hasTimeErrors = Object.values(timeErrors.value).some(error => error !== '');
    
    if (hasDateErrors || hasTimeErrors || registrationError.value) {
        return false;
    }
    
    if (!eventName.value || !eventVenue.value || !eventDescription.value || !eventPoster.value) {
        alert('Please fill in all required fields');
        return false;
    }

    if (multipleSection.value === 'yes') {
        if (!totalmaxRegistration.value) {
            alert('Please enter maximum registrations');
            return false;
        }

        for (const section of sections.value) {
            if (!section.name || !section.maxRegistration) {
                alert('Please fill in all section details');
                return false;
            }
        }
    }

    return true;
};

const handleSubmit = async () => {
    if (!validateForm()) return;
    
    isLoading.value = true;
    
    try {
        const formData = new FormData();
        formData.append('eventName', eventName.value);
        formData.append('eventDateFrom', eventDateFrom.value);
        formData.append('eventDateTo', eventDateTo.value);
        formData.append('eventTimeStart', eventTimeStart.value);
        formData.append('eventTimeEnd', eventTimeEnd.value);
        formData.append('eventVenue', eventVenue.value);
        formData.append('deadline', deadline.value);
        formData.append('eventType', eventType.value);
        formData.append('eventPrice', eventType.value === 'charged' ? eventPrice.value : 0);
        formData.append('eventDescription', eventDescription.value);
        formData.append('multipleSection', multipleSection.value);
        formData.append('totalmaxRegistration', totalmaxRegistration.value);
        formData.append('eventPoster', eventPoster.value);

        if (multipleSection.value === 'yes') {
            formData.append('sectionNumber', sectionNumber.value);
            formData.append('sections', JSON.stringify(sections.value));
        }

        const response = await axios.post('/api/eventnew', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 201) {
            localStorage.setItem('toastrMessage', 'Event created successfully!');
            window.location.href = '/event';
        }
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
    } finally {
        isLoading.value = false;
    }
};

// Watch for changes that require validation
watch([eventDateFrom, eventDateTo], validateDates);
watch([eventTimeStart, eventTimeEnd], validateTimes);
watch(deadline, validateDeadline);
watch(totalmaxRegistration, validateSectionRegistrations);
watch(multipleSection, (newVal) => {
    if (newVal === 'yes') {
        sectionNumber.value = 1;
        sections.value = [{ name: '', maxRegistration: null }];
    } else {
        sectionNumber.value = 0;
        sections.value = [];
    }
});

onMounted(() => {
    checkrole();
});
</script>

<template>
    <main class="event-creation-page">
        <Header />
        <div class="header-spacer"></div>

        <div v-if="isAdmin">
            <div class="creation-container">
                <div class="creation-card">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        <a href="/event" class="return-link">
                            <i class='bx bx-arrow-back'></i> Back to Events
                        </a>
                    </div>
                    
                    <h2 class="creation-title">Create New Event</h2>
                    
                    <form @submit.prevent="handleSubmit" class="creation-form">
                        <div class="form-grid">
                            <!-- Event Basic Info -->
                            <div class="form-section">
                                <h3 class="section-title">Basic Information</h3>
                                <div class="form-group">
                                    <label for="event-name">Event Name</label>
                                    <input type="text" id="event-name" v-model="eventName" 
                                           placeholder="Enter event name" required>
                                </div>
                                
                                <div class="form-row date-inputs-container">
    <div class="form-group">
        <label for="event-date-from">Start Date</label>
        <input type="date" id="event-date-from" :min="minDate" 
               v-model="eventDateFrom" required
               @change="validateDates">
        <span class="error-message" v-if="dateErrors.startDate">{{ dateErrors.startDate }}</span>
    </div>
    <div class="form-group">
        <label for="event-date-to">End Date</label>
        <input type="date" id="event-date-to" :min="eventDateFrom || minDate" 
               v-model="eventDateTo" required
               @change="validateDates">
        <span class="error-message" v-if="dateErrors.endDate">{{ dateErrors.endDate }}</span>
    </div>
</div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="event-time-start">Start Time</label>
                                        <input type="time" id="event-time-start" v-model="eventTimeStart" required
                                               @change="validateTimes">
                                        <span class="error-message" v-if="timeErrors.startTime">{{ timeErrors.startTime }}</span>
                                    </div>
                                    <div class="form-group">
                                        <label for="event-time-end">End Time</label>
                                        <input type="time" id="event-time-end" v-model="eventTimeEnd" required
                                               @change="validateTimes">
                                        <span class="error-message" v-if="timeErrors.endTime">{{ timeErrors.endTime }}</span>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="venue">Venue</label>
                                    <input type="text" id="venue" v-model="eventVenue" 
                                           placeholder="Enter event venue" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="deadline">Registration Deadline</label>
                                    <input type="date" id="deadline" :min="minDate" 
                                           v-model="deadline" required
                                           @change="validateDeadline">
                                    <span class="error-message" v-if="dateErrors.deadline">{{ dateErrors.deadline }}</span>
                                </div>
                            </div>
                            
                            <!-- Event Details -->
                            <div class="form-section">
                                <h3 class="section-title">Event Details</h3>
                                <div class="form-group">
                                    <label for="event-type">Event Type</label>
                                    <select id="event-type" v-model="eventType" required>
                                        <option value="free">Free</option>
                                        <option value="charged">Charged</option>
                                    </select>
                                </div>
                                
                                <div class="form-group" v-if="eventType === 'charged'">
                                    <label for="event-price">Event Price</label>
                                    <input type="number" id="event-price" 
                                           placeholder="Enter price" v-model="eventPrice" required min="0" step="0.01">
                                </div>
                                
                                <div class="form-group">
                                    <label for="event-description">Description</label>
                                    <textarea id="event-description" v-model="eventDescription"
                                              placeholder="Enter event description" rows="4" required></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="max-registration">Maximum Registrations</label>
                                    <input type="number" id="max-registration" v-model="totalmaxRegistration" 
                                           placeholder="Enter max registrations" required min="1">
                                </div>
                                
                                <div class="form-group">
                                    <label for="multiple-section">Multiple Sections?</label>
                                    <select id="multiple-section" v-model="multipleSection" 
                                            @change="handleSectionChange" required>
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Event Media -->
                            <div class="form-section">
                                <h3 class="section-title">Event Media</h3>
                                <div class="form-group file-upload">
                                    <label for="event-poster">Event Poster</label>
                                    <div class="upload-area" @click="$refs.fileInput.click()">
                                        <input type="file" id="eventPoster" ref="fileInput" 
                                               accept=".pdf,.png,.jpg,.jpeg" @change="handleFileChange" required hidden>
                                        <div v-if="!eventPoster" class="upload-placeholder">
                                            <i class='bx bx-cloud-upload'></i>
                                            <p>Click to upload poster</p>
                                            <small>Accepted formats: PDF, PNG, JPG (Max 5MB)</small>
                                        </div>
                                        <div v-else class="file-preview">
                                            <i class='bx bx-check-circle'></i>
                                            <p>{{ eventPoster.name }}</p>
                                            <button type="button" @click.stop="eventPoster = null" class="remove-file">
                                                <i class='bx bx-x'></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Sections (Conditional) -->
                        <div v-if="multipleSection === 'yes'" class="sections-container">
                            <div class="section-header">
                                <h3 class="section-title">Event Sections</h3>
                                <div class="form-group section-count">
                                    <label for="section-select">Number of Sections</label>
                                    <select v-model="sectionNumber" id="section-select" 
                                            @change="updateSections" required>
                                        <option v-for="num in 10" :key="num" :value="num">{{ num }}</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div v-for="(section, index) in sections" :key="index" class="section-card">
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
                                <i class='bx bx-calendar-plus'></i> 
                                <span v-if="!isLoading">Create Event</span>
                                <span v-else class="loading-spinner">Creating...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
/* All your existing styles remain the same, just add these new ones */

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

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-count {
    width: 150px;
}

/* Base Styles */
.event-creation-page {
    background-color: #f5f7fa;
    min-height: 100vh;
}

.header-spacer {
    height: 80px;
}

.creation-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.creation-card {
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

.creation-title {
    color: #2c3e50;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 600;
}

/* Form Layout */
.creation-form {
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

/* Form Elements */
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
input[type="date"] {
    width: 100%;
    box-sizing: border-box; /* Include padding in width calculation */
    max-width: 100%; /* Prevent overflow */
}
.date-inputs-container {
    display: flex;
    gap: 1rem;
    width: 100%;
}
/* File Upload */
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

/* Sections */
.sections-container {
    background: #f9fafc;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e1e5eb;
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

/* Submit Button */
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
}

.submit-btn:hover {
    background-color: #3a5a8f;
    transform: translateY(-2px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.submit-btn i {
    font-size: 1.2rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .creation-container {
        padding: 1rem;
    }
    
    .creation-card {
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
}
</style>

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
            deadline: '',
            multipleSection: 'no',
            totalmaxRegistration: null,
            sectionNumber: '0',
            sections: []
        }
    },
    methods: {
        handleFileChange(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PDF, JPG, or PNG file');
                event.target.value = '';
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                event.target.value = '';
                return;
            }
            
            this.eventPoster = file;
        },
        updateSections() {
            const currentLength = this.sections.length;
            const newLength = parseInt(this.sectionNumber);
            
            if (newLength > currentLength) {
                for (let i = currentLength; i < newLength; i++) {
                    this.sections.push({ name: '', maxRegistration: null });
                }
            } else if (newLength < currentLength) {
                this.sections = this.sections.slice(0, newLength);
            }
        },
        validateMaxRegistration() {
            if (this.multipleSection === 'yes') {
                const totalMaxRegistration = this.sections.reduce((sum, section) => sum + (section.maxRegistration || 0), 0);
                if (totalMaxRegistration !== this.totalmaxRegistration) {
                    alert(`Total maximum registrations for sections (${totalMaxRegistration}) must equal the overall maximum registrations (${this.totalmaxRegistration}).`);
                    return false;
                }
            }
            return true;
        },
        handleSubmit() {
            if (!this.validateMaxRegistration()) {
                return;
            }
            
            const dateFrom = new Date(this.eventDateFrom);
            const dateTo = new Date(this.eventDateTo);
            const timeStart = this.eventTimeStart.split(':');
            const timeEnd = this.eventTimeEnd.split(':');

            const startTime = new Date(dateFrom);
            startTime.setHours(timeStart[0], timeStart[1]);

            const endTime = new Date(dateTo);
            endTime.setHours(timeEnd[0], timeEnd[1]);

            if (dateTo < dateFrom) {
                alert('The "To" date cannot be earlier than the "From" date.');
                return;
            }

            if (dateFrom.getTime() === dateTo.getTime() && endTime < startTime) {
                alert('The end time cannot be earlier than the start time on the same day.');
                return;
            }

            const now = new Date();
            if (startTime < now) {
                alert('The event must be scheduled for the future.');
                return;
            }
            
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
            formData.append('totalmaxRegistration', this.totalmaxRegistration);
            formData.append('sectionNumber', this.multipleSection === 'yes' ? this.sectionNumber : 0);
            formData.append('eventPoster', this.eventPoster);
            formData.append('deadline', this.deadline);
            formData.append('sections', JSON.stringify(this.sections));

            axios.post('/api/eventnew', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then((response) => {
                if (response.status === 201) {
                    localStorage.setItem('toastrMessage', 'Event created successfully!');
                    window.location.href = '/event';
                }
            })
            .catch((error) => {
                console.error(error);
                alert('Error creating event. Please try again.');
            });
        }
    }
}
</script>