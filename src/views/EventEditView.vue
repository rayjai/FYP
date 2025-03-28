<template>
    <main>
        <Header />
        <div style="height: 80px;"></div>

        <div v-if="isAdmin">
            <div class="container">
                <div class="form-container" style="max-height: 80vh; overflow-y: auto;">
                    <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        <a href="/event"><i class='bx bx-arrow-back'></i></a>
                    </div>
                    <h2>Edit Event</h2>
                    <form @submit.prevent="handleSubmit">
                        <!-- Basic Event Info -->
                        <div class="form-group">
                            <label for="event-name">Event Name:</label>
                            <input type="text" id="event-name" v-model="event.eventName" required>
                        </div>

                        <!-- Date/Time Fields -->
                        <div class="grid2x1">
                            <div class="form-group">
                                <label for="event-date-from">Event Date (From):</label>
                                <input type="date" id="event-date-from" :min="minDate" v-model="event.eventDateFrom" required>
                            </div>
                            <div class="form-group">
                                <label for="event-date-to">Event Date (To):</label>
                                <input type="date" id="event-date-to" :min="event.eventDateFrom" v-model="event.eventDateTo" required>
                            </div>
                        </div>

                        <div class="grid2x1">
                            <div class="form-group">
                                <label for="event-time-start">Event Time (Start):</label>
                                <input type="time" id="event-time-start" v-model="event.eventTimeStart" required>
                            </div>
                            <div class="form-group">
                                <label for="event-time-end">Event Time (End):</label>
                                <input type="time" id="event-time-end" :min="event.eventTimeStart" v-model="event.eventTimeEnd" required>
                            </div>
                        </div>

                        <!-- Venue and Type -->
                        <div class="form-group">
                            <label for="venue">Venue:</label>
                            <input type="text" id="venue" v-model="event.eventVenue" required>
                        </div>

                        <div class="form-group">
                            <label for="event-type">Event Type:</label>
                            <select id="event-type" v-model="event.eventType" required>
                                <option value="free">Free</option>
                                <option value="charged">Charged</option>
                            </select>
                        </div>

                        <div class="form-group" v-if="event.eventType === 'charged'">
                            <label for="event-price">Event Price:</label>
                            <input type="number" id="event-price" v-model="event.eventPrice" required min="0" step="0.01">
                        </div>

                        <!-- Poster -->
                        <div class="form-group">
                            <label>Current Event Poster:</label>
                            <div v-if="event.eventPoster">
                                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" 
                                     alt="Current Event Poster" 
                                     class="current-poster" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="event-poster">New Event Poster:</label>
                            <input type="file" id="eventPoster" accept=".pdf,.png,.jpg,.jpeg" @change="handleFileChange" />
                            <small class="file-hint">Accepted formats: PDF, PNG, JPG (Max 5MB)</small>
                        </div>

                        <!-- Description -->
                        <div class="form-group">
                            <label for="event-description">Event Description:</label>
                            <textarea id="event-description" v-model="event.eventDescription" required></textarea>
                        </div>

                        <!-- Sections Management -->
                        <div class="form-group">
                            <label for="multiple-section">Multiple Sections?</label>
                            <select id="multiple-section" v-model="event.multipleSection" @change="handleSectionChange" required>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="max-registration">Maximum Registrations:</label>
                            <input type="number" id="max-registration" v-model="event.totalmaxRegistration" 
                                   required min="1">
                        </div>

                        <div class="form-group" v-if="event.multipleSection === 'yes'">
                            <label for="section-select">Number of Sections:</label>
                            <select v-model="event.sectionNumber" id="section-select" @change="updateSections" required>
                                <option v-for="num in 10" :key="num" :value="num">{{ num }}</option>
                            </select>
                        </div>

                        <div v-for="(section, index) in event.sections" :key="index" class="section-details" v-if="event.multipleSection === 'yes'">
                            <h4>Section {{ index + 1 }}</h4>
                            <div class="form-group">
                                <label :for="'section-name-' + index">Section Name:</label>
                                <input type="text" :id="'section-name-' + index" v-model="section.name" required>
                            </div>
                            <div class="form-group">
                                <label :for="'max-registration-' + index">Max Registrations:</label>
                                <input type="number" :id="'max-registration-' + index" 
                                       v-model.number="section.maxRegistration" required min="1">
                            </div>
                        </div>

                        <button type="submit" :disabled="isLoading">
                            {{ isLoading ? 'Updating...' : 'Update Event' }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css';

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
    eventType: 'free',
    eventPrice: 0,
    eventPoster: null,
    poster: null,
    eventDescription: '',
    multipleSection: 'no',
    totalmaxRegistration: null,
    sectionNumber: 0,
    sections:[{ name: '', maxRegistration: null }]
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
        
        // Ensure sections array matches sectionNumber
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
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PDF, JPG, or PNG file');
            e.target.value = '';
            return;
        }
        
        // Validate file size (5MB max)
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
        // Add new sections
        for (let i = currentLength; i < newLength; i++) {
            event.value.sections.push({ name: '', maxRegistration: null });
        }
    } else if (newLength < currentLength) {
        // Remove extra sections
        event.value.sections = event.value.sections.slice(0, newLength);
    }
};

const validateForm = () => {
    // Basic validation
    if (!event.value.eventName || !event.value.eventDateFrom || !event.value.eventDateTo || 
        !event.value.eventTimeStart || !event.value.eventTimeEnd || !event.value.eventVenue || 
        !event.value.eventDescription) {
        alert('Please fill in all required fields');
        return false;
    }

    // Validate dates
    const dateFrom = new Date(event.value.eventDateFrom);
    const dateTo = new Date(event.value.eventDateTo);
    if (dateTo < dateFrom) {
        alert('End date cannot be before start date');
        return false;
    }

    // Validate times when dates are same
    if (event.value.eventDateFrom === event.value.eventDateTo) {
        const start = new Date(`2000-01-01T${event.value.eventTimeStart}`);
        const end = new Date(`2000-01-01T${event.value.eventTimeEnd}`);
        if (end <= start) {
            alert('End time must be after start time when dates are the same');
            return false;
        }
    }

    // Validate future date
    const now = new Date();
    const eventStart = new Date(`${event.value.eventDateFrom}T${event.value.eventTimeStart}`);
    if (eventStart < now) {
        alert('Event must be scheduled in the future');
        return false;
    }

    // Validate sections if multiple sections enabled
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
            localStorage.setItem('toastrMessage', 'Event update Successfully!');
            window.location.href = '/event';
        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    checkrole();
    fetchEvent();
});
</script>

<style scoped>
.current-poster {
    max-width: 200px;
    max-height: 200px;
    display: block;
    margin-top: 10px;
}
.file-hint {
    display: block;
    color: #666;
    font-size: 0.8rem;
    margin-top: 0.25rem;
}
.section-details {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
}
button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>