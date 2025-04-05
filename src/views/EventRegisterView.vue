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

let registrationData = ref({
    student_id: '',
    selectedSection: null,
    event_id: inieventid,
    attendance: false,
    eventName: eventName,
    eventFromDate: eventDateFrom.value,
    paymentMethod: '',
    sectionDetails: null
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
            registrationData.value.student_id = decoded.user.student_id;
            console.log(registrationData.value.student_id);
        }
        user.value = decoded.user;
    }
}

const event = ref({
    sections: []
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
        registrationCount.value =  data.totalRegistrations;
    } catch (error) {
        console.error('Error fetching registration count:', error);
        errorMessage.value = 'Failed to load registration count: ' + error.message;
        return 0;
    }
}

const handleCheckout = async () => {
    isLoading.value = true;
    uniqueKey.value = Date.now() + Math.random(); 

    registrationData.value.event_id = inieventid.value;
    registrationData.value.eventName = eventName.value;
    registrationData.value.eventDateFrom = eventDateFrom.value;

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
    
    formData.append('student_id', registrationData.value.student_id);
    formData.append('event_id', registrationData.value.event_id);
    formData.append('attendance', registrationData.value.attendance);
    formData.append('eventName', registrationData.value.eventName);
    formData.append('eventDateFrom', registrationData.value.eventDateFrom);
    formData.append('paymentMethod', registrationData.value.paymentMethod);
    
    if (registrationData.value.selectedSection !== null) {
        formData.append('selectedSection', registrationData.value.selectedSection);
        
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
    <div class="header-spacer"></div>

    <div class="event-container">
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
                        {{ event.eventTimeStart }} - {{ event.eventTimeEnd }}
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
                </div>
            </div>
        </div>

        <div class="event-description">
            <h2>About the Event</h2>
            <p>{{ event.eventDescription }}</p>
        </div>

        <div class="registration-section" v-if="isStudent || isAdmin">
            <div class="registration-card">
                <h2>Register for this Event</h2>
                <div v-if="isEventFull" class="alert alert-danger">
                    <strong>Event Full!</strong> Registration is closed as the event has reached maximum capacity.
                </div>
                <div v-else-if="!canRegister" class="alert alert-warning">
                    <strong>Registration Closed!</strong> 
                </div>
                <form id="register-event" @submit.prevent="handleSubmit">
                    
                    <div v-if="isAdmin" class="form-group">
                        <label for="student_id">Student ID</label>
                        <input type="text" id="student_id" v-model="registrationData.student_id" placeholder="Enter student ID" required>
                    </div>

                    <!-- Section Selection -->
                    <div v-if="event.sections && event.sections.length > 0" class="form-group">
                        <label>Select Section</label>
                        <div class="section-options">
                            <div v-for="(section, index) in event.sections" :key="index" class="section-option">
                                <input 
                                    type="radio" 
                                    :id="'section-' + index" 
                                    :value="section.name" 
                                    v-model="registrationData.selectedSection"
                                    class="section-radio"
                                />
                                <label :for="'section-' + index" class="section-label">
                                    <span class="section-name">{{ section.name }}</span>
                                    <span class="section-details" v-if="section.description">{{ section.description }}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Method Selection -->
                    <div v-if="event.eventType === 'charged'" class="form-group">
                        <label for="payment-method">Payment Method</label>
                        <div class="payment-methods">
                            <select id="payment-method" v-model="registrationData.paymentMethod" required class="payment-select">
                                <option value="" disabled>Select payment method</option>
                                <option value="online">💳 Online Payment</option>
                                <option value="fps">📱 FPS Transfer</option>
                                <option value="cash">💵 Cash Payment</option>
                            </select>
                        </div>
                    </div>

                    <!-- Payment Method Specific Sections -->
                    <div v-if="registrationData.paymentMethod === 'online'" class="payment-info">
                        <div class="info-box">
                            <p>You will be redirected to our secure payment gateway to complete your registration.</p>
                        </div>
                    </div>

                    <div v-if="registrationData.paymentMethod === 'fps'" class="payment-info">
                        <div class="info-box">
                            <h3>FPS Payment Instructions</h3>
                            <ol>
                                <li>Transfer <strong>HK${{ event.eventPrice }}</strong> to our FPS account</li>
                                <li>FPS ID: <strong>{{ content.fpsPaymentNumber }}</strong></li>
                                <li>Upload your payment confirmation screenshot below</li>
                            </ol>
                            <div class="form-group">
                                <label for="fpsPaymentPhoto" class="file-upload-label">
                                    <span class="upload-icon">📤</span>
                                    <span>Upload Payment Proof</span>
                                    <input type="file" id="fpsPaymentPhoto" 
                                        @change="handleFileChange" 
                                        accept="image/*" required />
                                </label>
                                <div v-if="fpsPaymentPhoto" class="file-preview">
                                    Selected file: {{ fpsPaymentPhoto.name }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Terms and Conditions -->
                    <div class="form-group terms-group">
                        <label class="terms-label">Terms & Conditions</label>
                        <div class="terms-box" ref="termsContent" @scroll="checkScroll">
                            <h3>Terms of Agreement for Event Registration</h3>
                            <p>1. Acceptance of Terms<br>
                            By registering for an event organized by the Computer Science Society, you agree to comply with and be bound by these Terms of Agreement.<br><br>
                            
                            2. Eligibility<br>
                            Participation in events is open to all registered students of HKBU. You must be a current student to register.<br><br>
                            
                            3. Registration<br>
                            You must complete the online registration form accurately. By submitting your registration, you confirm that the information provided is true and complete.<br><br>
                            
                            4. Payment<br>
                            Some events may require a fee. Payment must be completed prior to the event date. No refunds will be issued for cancellations made after the registration deadline.<br><br>
                            
                            5. Code of Conduct<br>
                            Participants are expected to behave respectfully towards others. Any form of harassment, discrimination, or disruptive behavior will not be tolerated and may result in removal from the event.<br><br>
                            
                            6. Liability Waiver<br>
                            By participating in events, you acknowledge that you do so at your own risk. The Computer Science Society and HKBU are not liable for any injuries, losses, or damages incurred during the event.<br><br>
                            
                            7. Media Release<br>
                            By attending events, you consent to being photographed and recorded. These images may be used for promotional purposes by the Computer Science Society and HKBU.<br><br>
                            
                            8. Changes to Terms<br>
                            The Computer Science Society reserves the right to modify these Terms of Agreement at any time. Changes will be communicated via email or through our official channels.<br><br>
                            
                            9. Contact Information<br>
                            For any questions regarding these terms, please contact us at cpu@gmail.com.</p>
                        </div>
                        <div class="terms-agreement">
                            <input type="checkbox" id="understand" required class="terms-checkbox" />
                            <label for="understand" class="terms-agreement-label">
                                I have read and agree to the terms and conditions above
                            </label>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="form-actions">
                        <button type="submit" :disabled="isLoading || isEventFull || !canRegister" class="submit-button">
                            <span v-if="isLoading" class="button-loading">
                                <span class="spinner"></span> Processing...
                            </span>
                            <span v-else>
                                {{ registrationData.paymentMethod === 'online' ? 'Register & Pay Now' : 'Complete Registration' }}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.header-spacer {
    height: 80px;
}

.event-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
}

.event-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    align-items: flex-start;
}

.event-poster-container {
    flex: 0 0 40%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-poster {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
}

.event-poster:hover {
    transform: scale(1.02);
}

.event-meta {
    flex: 1;
}

.event-title {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-weight: 700;
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
    padding: 0.8rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.detail-icon {
    font-size: 1.2rem;
}

.event-description {
    margin: 2rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-description h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.8rem;
}

.event-description p {
    line-height: 1.6;
    font-size: 1.1rem;
}

.registration-section {
    margin-top: 3rem;
}

.registration-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.registration-card h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.8rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
}

input[type="text"],
select {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

input[type="text"]:focus,
select:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* Section Selection Styling */
.section-options {
    display: grid;
    gap: 0.8rem;
    margin-top: 0.5rem;
}

.section-option {
    position: relative;
}

.section-radio {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.section-label {
    display: block;
    padding: 1rem 1.2rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #f8fafc;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    padding-left: 2.5rem;
}

.section-label:hover {
    background-color: #f0f7ff;
    border-color: #cbd5e0;
}

.section-radio:checked + .section-label {
    border-color: #3498db;
    background-color: #ebf5ff;
    box-shadow: 0 0 0 1px #3498db;
}

.section-radio:focus + .section-label {
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

/* Custom radio button */
.section-label::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid #cbd5e0;
    border-radius: 50%;
    background-color: white;
    transition: all 0.2s ease;
}

.section-radio:checked + .section-label::before {
    border-color: #3498db;
    background-color: #3498db;
    box-shadow: inset 0 0 0 3px white;
}

.section-name {
    display: block;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.3rem;
}

.section-details {
    display: block;
    font-size: 0.9rem;
    color: #4a5568;
    line-height: 1.4;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .section-label {
        padding: 0.8rem 1rem 0.8rem 2.2rem;
    }
    
    .section-label::before {
        left: 0.8rem;
        width: 1rem;
        height: 1rem;
    }
    
    .section-name {
        font-size: 0.95rem;
    }
    
    .section-details {
        font-size: 0.85rem;
    }
}

.payment-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
}

.payment-info {
    margin: 1.5rem 0;
}

.info-box {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #3498db;
}

.info-box h3 {
    margin-top: 0;
    color: #2c3e50;
}

.info-box ol {
    padding-left: 1.5rem;
}

.info-box li {
    margin-bottom: 0.5rem;
}

.file-upload-label {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1.5rem;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.file-upload-label:hover {
    border-color: #3498db;
    background: #f0f7ff;
}

.file-upload-label input[type="file"] {
    display: none;
}

.upload-icon {
    font-size: 1.2rem;
}

.file-preview {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
}

.terms-group {
    margin-top: 2rem;
}

.terms-label {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
    display: block;
}

.terms-box {
    max-height: 200px;
    overflow-y: auto;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
    line-height: 1.6;
    font-size: 0.95rem;
}

.terms-box h3 {
    margin-top: 0;
    color: #2c3e50;
}

.terms-agreement {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.terms-checkbox {
    width: 1.2rem;
    height: 1.2rem;
}

.terms-agreement-label {
    cursor: pointer;
    user-select: none;
}

.form-actions {
    margin-top: 2rem;
}

.submit-button {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #2980b9, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.submit-button:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    opacity: 0.7;
}

.button-loading {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
}

.spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.alert {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-weight: 500;
}

.alert-danger {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.alert-warning {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
}

@media (max-width: 768px) {
    .event-header {
        flex-direction: column;
    }
    
    .event-poster-container {
        width: 100%;
    }
    
    .event-details-grid {
        grid-template-columns: 1fr;
    }
    
    .section-options {
        grid-template-columns: 1fr;
    }
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