<template>
    <div class="registration-detail-container">
      <div class="header">
        <h1>Registration Details</h1>
        <button @click="goBack" class="back-button">
           Back
        </button>
      </div>
  
      <div class="registration-card">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading registration details...</p>
        </div>
  
        <div v-else-if="registration" class="registration-content">
          <!-- Basic Information Section -->
          <div class="detail-section">
            <h2 class="section-title">Basic Information</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Event Name:</label>
                <div class="detail-value">{{ registration.eventName }}</div>
              </div>
              <div class="detail-item">
                <label>Student ID:</label>
                <div class="detail-value">{{ registration.student_id }}</div>
              </div>
              <div class="detail-item">
                <label>Student Name:</label>
                <div class="detail-value">{{ userData?.english_name || 'N/A' }}</div>
              </div>
              <div class="detail-item">
                <label>Event Date:</label>
                <div class="detail-value">{{ formatDate(registration.eventDateFrom) }}</div>
              </div>
              <div class="detail-item">
                <label>Payment Method:</label>
                <div class="detail-value">
                  {{ formatPaymentMethod(registration.paymentMethod) }}
                  <span v-if="registration.paymentMethod === 'fps' && !registration.confirm" class="status-badge pending">
                    Pending
                  </span>
                  <span v-else-if="registration.confirm" class="status-badge confirmed">
                    Confirmed
                  </span>
                </div>
              </div>
              <div class="detail-item" v-if="registration.sectionData?.sectionName">
                <label>Section:</label>
                <div class="detail-value">{{ registration.sectionData.sectionName }}</div>
              </div>
              <div class="detail-item">
                <label>Attendance:</label>
                <div class="detail-value">
                  {{ registration.attendance ? 'Present' : 'Absent' }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- Payment Proof Section -->
          <div class="detail-section" v-if="registration.paymentMethod === 'fps' && registration.fpsPaymentPhoto">
            <h2 class="section-title">Payment Proof</h2>
            <div class="payment-proof">
              <img 
                :src="`http://localhost:3000/uploads/${registration.fpsPaymentPhoto}`" 
                alt="FPS Payment Proof"
                class="payment-image"
                @click="openImageModal"
              />
            </div>
          </div>
  
          <!-- Category Selection and Payment Actions -->
          <!-- <div class="detail-section" v-if="registration.paymentMethod === 'fps' && !registration.confirm">
            <h2 class="section-title">Payment Confirmation</h2>
            <div class="category-selection">
              <div class="form-group">
                <label for="financeCategory">Select Finance Category</label>
                <select 
                  id="financeCategory" 
                  v-model="selectedCategory" 
                  class="form-select"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option v-for="category in categories" :key="category._id" :value="category">
                    {{ category.code }} - {{ category.category }}
                  </option>
                </select>
                <p v-if="categoryError" class="error-message">{{ categoryError }}</p>
              </div>
              <div class="payment-actions">
                <button @click="confirmPayment" class="btn btn-confirm">
                 Confirm Payment
                </button>
                <button @click="rejectPayment" class="btn btn-reject">
                  Reject Payment
                </button>
              </div>
            </div>
          </div> -->
  
          <!-- Timestamps Section -->
          <div class="detail-section">
            <h2 class="section-title">Timestamps</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Created At:</label>
                <div class="detail-value">{{ formatDateTime(registration.createdAt) }}</div>
              </div>
              <div class="detail-item">
                <label>Modified At:</label>
                <div class="detail-value">{{ formatDateTime(registration.modifiedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
  
        <div v-else class="empty-state">
          <i class='bx bx-error-circle'></i>
          <p>No registration details found</p>
        </div>
      </div>
  
      <!-- Image Modal -->
      <div v-if="showImageModal" class="image-modal" @click.self="closeImageModal">
        <div class="modal-content">
          <button @click="closeImageModal" class="close-button">
            <i class='bx bx-x'></i>
          </button>
          <img 
            :src="`http://localhost:3000/uploads/${registration.fpsPaymentPhoto}`" 
            alt="Enlarged Payment Proof"
            class="enlarged-image"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  import toastr from 'toastr';
  import 'toastr/build/toastr.min.css';
  
  const route = useRoute();
  const router = useRouter();
  
  const registration = ref(null);
  const userData = ref(null);
  const loading = ref(true);
  const showImageModal = ref(false);
  const categories = ref([]);
  const selectedCategory = ref(null);
  const categoryError = ref('');
  
  // Initialize toastr
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: 3000
  };
  
  onMounted(async () => {
    try {
      // Fetch registration details
      const registrationResponse = await axios.get(`/api/registrations/detail/${route.params.id}`);
      registration.value = registrationResponse.data;
      
      // Fetch user details
      if (registration.value.student_id) {
        const userResponse = await axios.get(`/api/user/detail/${registration.value.student_id}`);
        userData.value = userResponse.data;
      }
      
      // Fetch finance categories only if payment needs confirmation
      if (registration.value.paymentMethod === 'fps' && !registration.value.confirm) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toastr.error('Failed to load registration details');
    } finally {
      loading.value = false;
    }
  });
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/finance_category');
      categories.value = response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      toastr.error('Failed to load finance categories');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatPaymentMethod = (method) => {
    const methods = {
      'fps': 'FPS Transfer',
      'cash': 'Cash',
      'online': 'Online Payment'
    };
    return methods[method] || method;
  };
  
  const openImageModal = () => {
    if (registration.value?.fpsPaymentPhoto) {
      showImageModal.value = true;
    }
  };
  
  const closeImageModal = () => {
    showImageModal.value = false;
  };
  
  const confirmPayment = async () => {
    // Validate category selection
    if (!selectedCategory.value) {
      categoryError.value = 'Please select a finance category';
      return;
    }
    categoryError.value = '';
  
    try {
      // First confirm the payment
      await axios.patch(`/api/registrations/${registration.value._id}/confirm`);
      
      // Then create the income record
      const incomeRecord = {
        title: registration.value.eventName,
        date: registration.value.eventDateFrom,
        category: selectedCategory.value.category,
        code: selectedCategory.value.code,
        personInCharge: "Admin", // You might want to get this from user data
        feeItems: [{
          feeItem: 'Event Registration',
          itemName: registration.value.eventName,
          quantity: 1,
          unitPrice: 0, // You should get this from event data
          discount: 0,
          amount: 0    // You should calculate this
        }],
        remarks: 'Event registration payment',
        createReceipt: true,
        issueDate: new Date().toISOString(),
        billTo: registration.value.student_id,
        totalAmount: 0 // You should calculate this
      };
  
      await axios.post('/api/income', incomeRecord);
      
      registration.value.confirm = true;
      toastr.success('Payment confirmed and income record created successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toastr.error('Failed to confirm payment');
    }
  };
  
  const rejectPayment = async () => {
    try {
      await axios.patch(`/api/registrations/${registration.value._id}/reject`);
      registration.value.confirm = false;
      registration.value.fpsPaymentPhoto = null;
      toastr.success('Payment rejected successfully');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toastr.error('Failed to reject payment');
    }
  };
  
  const goBack = () => {
    router.go(-1);
  };
  </script>
  
  <style scoped>
  .registration-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .header h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin: 0;
  }
  
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #4a6fa5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .back-button:hover {
    background-color: #3a5a8f;
    transform: translateY(-2px);
  }
  
  .registration-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    margin-top: 1rem;
  }
  
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #4a6fa5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6c757d;
  }
  
  .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .detail-section {
    margin-bottom: 2rem;
  }
  
  .section-title {
    font-size: 1.4rem;
    color: #4a6fa5;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f4f8;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .detail-item {
    margin-bottom: 1rem;
  }
  
  .detail-item label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #4a6fa5;
  }
  
  .detail-value {
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
  }
  
  .status-badge.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .status-badge.confirmed {
    background-color: #d4edda;
    color: #155724;
  }
  
  .payment-proof {
    margin-top: 1rem;
    text-align: center;
  }
  
  .payment-image {
    max-width: 100%;
    max-height: 400px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .payment-image:hover {
    transform: scale(1.02);
  }
  
  .category-selection {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a6fa5;
  }
  
  .form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
    background-color: white;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .payment-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 1rem;
  }
  
  .btn i {
    font-size: 1.2rem;
  }
  
  .btn-confirm {
    background: #28a745;
    color: white;
  }
  
  .btn-confirm:hover {
    background: #218838;
    transform: translateY(-2px);
  }
  
  .btn-reject {
    background: #dc3545;
    color: white;
  }
  
  .btn-reject:hover {
    background: #c82333;
    transform: translateY(-2px);
  }
  
  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .enlarged-image {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 8px;
  }
  
  .close-button {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .detail-grid {
      grid-template-columns: 1fr;
    }
    
    .payment-actions {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>