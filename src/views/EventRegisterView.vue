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
const stripe = ref(null); // Stripe instance
const eventType = ref();
const eventPrice = ref();
const uniqueKey = ref(null); // Unique key for tracking submission

const fpsPaymentPhoto = ref(null); // To store the uploaded photo for FPS payment


let registrationData = ref({
    student_id: '',
    selectedSession: '0',
    multipleSection:'0',
    event_id: inieventid,
    attendance:false,
    eventName:eventName,
    eventFromDate:eventDateFrom.value,
    paymentMethod:'',
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
   
});
const termsAgreed = ref(false);
const termsContent = ref(null);

async function fetchEventDetails() {
    const eventId = route.params.id;
    registrationData.event_id = route.params.id;
    try {
        const response = await fetch('/api/event/detail/' + eventId
            , { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
        sectionNumber.value = Number(event.value.sectionNumber);
        eventDateFrom.value = event.value.eventDateFrom;
        eventName.value = event.value.eventName;
        eventType.value = event.value.eventType;
        eventPrice.value = event.value.eventPrice; // Add this line in fetchEventDetails

    } catch (error) {
        console.error('Error fetching event details:', error);
    }
};
const checkScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = termsContent.value;
    termsAgreed.value = scrollTop + clientHeight >= scrollHeight;
};
const isLoading = ref(false);

const handleCheckout = async () => {
    isLoading.value = true;
    uniqueKey.value = Date.now() + Math.random(); 

    // Collect all necessary data for registration
    registrationData.value.event_id = inieventid.value; // Ensure this is set correctly
    registrationData.value.eventName = eventName.value; // Set event name
    registrationData.value.eventDateFrom = eventDateFrom.value; // Set event date from

    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            eventName: registrationData.value.eventName,
            eventPrice: eventPrice.value * 100,
            registrationData: registrationData.value,
            uniqueKey: uniqueKey.value,
        }),
    });

    const session = await response.json();
    if (session.url) {
        window.location.href = session.url; // Redirect to Stripe Checkout
    } else {
        console.error('Error creating session:', session.message || 'No message returned');
    }
    isLoading.value = false;
};


const handleFileChange = (event) => {
    fpsPaymentPhoto.value = event.target.files[0];
    console.log('FPS payment photo:', fpsPaymentPhoto.value); // Debugging line
};


const handleSubmit = async () => {
    registrationData.value.eventName = eventName.value;
    registrationData.value.eventDateFrom = eventDateFrom.value;

    const formData = new FormData();
    
    // Append all necessary fields from registrationData
    formData.append('student_id', registrationData.value.student_id);
    formData.append('selectedSession', registrationData.value.selectedSession);
    formData.append('multipleSection', registrationData.value.multipleSection); // Include multipleSection
    formData.append('event_id', registrationData.value.event_id);
    formData.append('attendance', registrationData.value.attendance); // Include attendance
    formData.append('eventName', registrationData.value.eventName); // Include eventName
    formData.append('eventDateFrom', registrationData.value.eventDateFrom); // Include eventFromDate
    formData.append('paymentMethod', registrationData.value.paymentMethod);
    
    // Check if the payment method is FPS and if a photo is uploaded
    if (registrationData.value.paymentMethod === 'fps' && fpsPaymentPhoto.value) {
        formData.append('fpsPaymentPhoto', fpsPaymentPhoto.value); // Append the uploaded photo
    }
console.log(formData);
    if (registrationData.value.paymentMethod === 'online') {
        // Call handleCheckout instead of submitting the form
        await handleCheckout();
    } else {
        // Regular form submission logic
        try {
            const response = await fetch('/api/eventregister', {
                method: 'POST',
                body: formData, // No need for headers; FormData sets the correct Content-Type
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

const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

async function fetchHomeContent() {
  try {
    const response = await fetch('/api/club/detail/'+ clubId.value);
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
})

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

        <div v-if="isStudent">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student id:</label>
                    <input type="text" id="student_id" v-model="registrationData.student_id" placeholder="12345678"
                        required>
                </div>
                <div v-if="event.sectionNumber != 0">
                    <div class="form-group">
                        <label>Select Session:</label>
                        <div style="display: flex; flex-direction: column;">
                    <div v-for="index in sectionNumber" :key="index">
                        <div class="radio-select">
                            <input type="radio" :id="'session-' + index" :value="index" v-model="registrationData.selectedSession" />
                            <label :for="'session-' + index" style="padding-left: 10px;">Session {{ index }}</label>
                        </div>
                    </div>
                </div>
                    </div>
                </div>
                <div v-else><input type="radio" value="0" v-model="registrationData.multipleSection" hidden /></div>
                

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

                <!-- Online Payment Section -->
                <div v-if="registrationData.paymentMethod === 'online'">
                    <h3>You will be redirected to the online payment platform later</h3>
                </div>

                <!-- FPS Payment Section -->
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
                <div class="form-group">
                    <div class="terms" ref="termsContent" @scroll="checkScroll"
                        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                        <h3>Terms of Agreement</h3>
                        <p>Your terms of agreement content goes here...</p>
                        <p>1. Member should attend the event.</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                        <p>xxx...</p>
                    </div>
                    <input type="checkbox" id="understand" required />
                    <label for="understand" class="custom-checkbox-label">I have read and understand the terms of
                        agreement.</label>
                </div>
                <div v-if="registrationData.paymentMethod === 'online'">
                    <button type="submit" :disabled="isLoading">Register and Pay Online</button>
                </div>
                <div v-else>
                    <button type="submit">Register</button>
                </div>
            </form>
        </div>
        <div v-if="isAdmin">
            <h2>Register Event</h2>
            <form id="register-event" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="event-name">Student id:</label>
                    <input type="text" id="student_id" v-model="registrationData.student_id" placeholder="12345678"
                        required>
                </div>
                <div v-if="event.sectionNumber != 0">
                    <div class="form-group">
                        <label>Select Session:</label>
                        <div style="display: flex; flex-direction: column;">
                    <div v-for="index in sectionNumber" :key="index">
                        <div class="radio-select">
                            <input type="radio" :id="'session-' + index" :value="index" v-model="registrationData.selectedSession" />
                            <label :for="'session-' + index" style="padding-left: 10px;">Session {{ index }}</label>
                        </div>
                    </div>
                </div>
                    </div>
                </div>
                <div v-else><input type="radio" value="0" v-model="registrationData.multipleSection" hidden /></div>
                <button type="submit">Register</button>
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


