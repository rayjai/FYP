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
const stripe = ref(null);
const eventType = ref();
const totalmaxRegistration = ref();
const eventPrice = ref();
const uniqueKey = ref(null);
const fpsPaymentPhoto = ref(null);
const isLoading = ref(false);
const registrationCount = ref(0);
const canRegister = ref(true);



// Enhanced registration data structure
let registrationData = ref({
    student_id: '',
    selectedSection: null, // Changed from selectedSession to selectedSection
    event_id: inieventid,
    attendance: false,
    eventName: eventName,
    eventFromDate: eventDateFrom.value,
    paymentMethod: '',
    sectionDetails: null // For storing section-specific data
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
    sections: [] // Ensure sections array exists
});
const termsAgreed = ref(false);
const termsContent = ref(null);


async function fetchEventDetails() {
    const eventId = route.params.id;
    registrationData.value.event_id = eventId;
    try {
        const response = await fetch('/api/event/detail/' + eventId, { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
        sectionNumber.value = Number(event.value.sectionNumber);
        eventDateFrom.value = event.value.eventDateFrom;
        eventName.value = event.value.eventName;
        eventType.value = event.value.eventType;
        eventPrice.value = event.value.eventPrice;
        totalmaxRegistration.value = event.value.totalmaxRegistration;
        canRegister.value = event.value.canRegister;


       // Initialize section selection if sections exist
       if (event.value.sections && event.value.sections.length > 0) {
            registrationData.value.sectionDetails = event.value.sections;
        }
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}



const checkScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = termsContent.value;
    termsAgreed.value = scrollTop + clientHeight >= scrollHeight;
};

async function fetchRegistrationCount() {
    const eventId = route.params.id;
    try {
        const response = await fetch(`/api/admincheckregistrations/${eventId}/count`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        registrationCount.value =  data.totalRegistrations; // Returns the count (number)
    } catch (error) {
        console.error('Error fetching registration count:', error);
        // Handle error (show message, return 0, etc.)
        errorMessage.value = 'Failed to load registration count: ' + error.message;
        return 0; // Fallback value
    }
}

const handleCheckout = async () => {
    isLoading.value = true;
    uniqueKey.value = Date.now() + Math.random(); 

    registrationData.value.event_id = inieventid.value;
    registrationData.value.eventName = eventName.value;
    registrationData.value.eventDateFrom = eventDateFrom.value;

    // Include section details in the checkout data if available
    const checkoutData = {
        eventName: registrationData.value.eventName,
        eventPrice: eventPrice.value * 100,
        registrationData: {
            ...registrationData.value,
            selectedSection: registrationData.value.selectedSection
        },
        uniqueKey: uniqueKey.value,
    };

    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
    });

    const session = await response.json();
    if (session.url) {
        window.location.href = session.url;
    } else {
        console.error('Error creating session:', session.message || 'No message returned');
    }
    isLoading.value = false;
};

const handleFileChange = (event) => {
    fpsPaymentPhoto.value = event.target.files[0];
};

const handleSubmit = async () => {
    registrationData.value.eventName = eventName.value;
    registrationData.value.eventDateFrom = eventDateFrom.value;

    const formData = new FormData();
    
    // Basic registration data
    formData.append('student_id', registrationData.value.student_id);
    formData.append('event_id', registrationData.value.event_id);
    formData.append('attendance', registrationData.value.attendance);
    formData.append('eventName', registrationData.value.eventName);
    formData.append('eventDateFrom', registrationData.value.eventDateFrom);
    formData.append('paymentMethod', registrationData.value.paymentMethod);
    
    // Section-specific data
    if (registrationData.value.selectedSection !== null) {
        formData.append('selectedSection', registrationData.value.selectedSection);
        
        // Include section details if available
        if (registrationData.value.sectionDetails) {
            const selectedSection = registrationData.value.sectionDetails.find(
                section => section.name === registrationData.value.selectedSection
            );
            if (selectedSection) {
                formData.append('sectionName', selectedSection.name);
                formData.append('sectionMaxRegistration', selectedSection.maxRegistration);
            }
        }
    }

    // Payment data
    if (registrationData.value.paymentMethod === 'fps' && fpsPaymentPhoto.value) {
        formData.append('fpsPaymentPhoto', fpsPaymentPhoto.value);
    }

    if (registrationData.value.paymentMethod === 'online') {
        await handleCheckout();
    } else {
        try {
            const response = await fetch('/api/eventregister', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error submitting register');
            }

            const data = await response.json();
            console.log(data);
            localStorage.setItem('toastrMessage', 'Event Registration Successful!');
            router.push('/event');
        } catch (error) {
            console.error('Error submitting register:', error);
            alert('Error registering for the event. Please try again.');
        }
    }
};
const isEventFull = computed(() => {
    return totalmaxRegistration.value - registrationCount.value <= 0;
});


const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

async function fetchHomeContent() {
    try {
        const response = await fetch('/api/club/detail/' + clubId.value);
        const data = await response.json();
        content.value = data;
    } catch (error) {
        console.error('Error fetching home events:', error);
    }
};

onMounted(() => {
    checkrole();
    fetchEventDetails();
    fetchHomeContent();
    fetchRegistrationCount();
});
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
            <span v-if='event.eventType === "free"'>-</span>
            <span v-else>{{ event.eventPrice }}</span>
        </p>
        <p><strong>Venue: </strong> {{ event.eventVenue }} </p>
        <p><strong>Registration Deadline: </strong> {{ event.deadline }} </p>

    </div>

    <div class="register-info">
        <div v-if="isStudent || isAdmin">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student ID:</label>
                    <input type="text" id="student_id" v-model="registrationData.student_id" placeholder="12345678" required>
                </div>

                <!-- Section Selection -->
                <div v-if="event.sections && event.sections.length > 0">
    <div class="form-group">
        <label>Select Section:</label>
        <div style="display: flex; flex-direction: column;">
            <div v-for="(section, index) in event.sections" :key="index">
                <div class="radio-select">
                    <input 
                        type="radio" 
                        :id="'section-' + index" 
                        :value="section.name" 
                        v-model="registrationData.selectedSection"
                    />
                    <label :for="'section-' + index" style="padding-left: 10px;">
                        {{ section.name }} 
                    </label>
                </div>
            </div>
        </div>
    </div>
</div>


                <!-- Payment Method Selection -->
                <div v-if="event.eventType === 'charged'">
                    <div class="form-group">
                        <label for="payment-method">Payment Method:</label>
                        <select id="payment-method" v-model="registrationData.paymentMethod" required>
                            <option value="" disabled>Select a payment method</option>
                            <option value="online">Online Payment</option>
                            <option value="fps">FPS Payment</option>
                            <option value="cash">Cash</option>
                        </select>
                    </div>
                </div>

                <!-- Payment Method Specific Sections -->
                <div v-if="registrationData.paymentMethod === 'online'">
                    <p>You will be redirected to the online payment platform later</p>
                </div>

                <div v-if="registrationData.paymentMethod === 'fps'">
                    <h3>FPS Payment</h3>
                    <p>Please transfer ${{ event.eventPrice }} to Tel:{{ content.fpsPaymentNumber }}</p>
                    <div class="form-group">
                        <label for="fpsPaymentPhoto">Upload Payment Screenshot:</label>
                        <input type="file" id="fpsPaymentPhoto" 
                            @change="handleFileChange" 
                            accept="image/*" required />
                    </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="form-group">
                    <div class="terms" ref="termsContent" @scroll="checkScroll"
                        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                        <h3>Terms of Agreement</h3>
                        <p>Your terms of agreement content goes here...</p>
                    </div>
                    <input type="checkbox" id="understand" required />
                    <label for="understand" class="custom-checkbox-label">
                        I have read and understand the terms of agreement.
                    </label>
                </div>

                <!-- Submit Button -->
                <div v-if="registrationData.paymentMethod === 'online'">
                    <button type="submit" :disabled="isLoading">
                        {{ isLoading ? 'Processing...' : 'Register and Pay Online' }}
                    </button>
                </div>
                <div v-else>
                    <button type="submit" :disabled="isLoading || isEventFull || !canRegister">
                        {{ isLoading ? 'Processing...' : 'Register' }}
                    </button>
                    <div v-if="isEventFull" style="color: red; margin-top: 10px;">
            The event is full. You cannot register at this time.
        </div>
                </div>
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

.register-info {
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.radio-select {
    margin: 5px 0;
    display: flex;
    align-items: center;
}

button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #0056b3;
}

.custom-checkbox-label {
    margin-left: 5px;
}
</style>