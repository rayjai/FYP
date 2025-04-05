<template>
  <div class="inventory-detail-container">
    <div class="header-section">
      <h1 class="page-title">
        <i class='bx bx-package'></i> Inventory Item Details
      </h1>
      <div class="action-buttons">
        <button 
          v-if="isEditing" 
          @click="cancelEdit" 
          class="btn btn-outline"
        >
          <i class='bx bx-x'></i> Cancel
        </button>
        <button 
          @click="toggleEdit" 
          :class="['btn', isEditing ? 'btn-primary' : 'btn-secondary']"
        >
          <i :class="isEditing ? 'bx bx-check' : 'bx bx-edit'"></i>
          {{ isEditing ? 'Save Changes' : 'Edit' }}
        </button>
        <button 
          @click="confirmDelete" 
          class="btn btn-danger"
        >
          <i class='bx bx-trash'></i> Delete
        </button>
      </div>
    </div>

    <div class="detail-card">
      <div v-if="!record" class="loading-state">
        <div class="spinner"></div>
        <p>Loading inventory details...</p>
      </div>

      <div v-else class="detail-content">
        <!-- Basic Information Section -->
        <div class="detail-section">
          <h2 class="section-title">
            <i class='bx bx-info-circle'></i> Basic Information
          </h2>
          <div class="detail-grid">
            <div class="form-group">
              <label><i class='bx bx-rename'></i> Name</label>
              <div v-if="!isEditing" class="detail-value">{{ record.name || 'N/A' }}</div>
              <input v-else v-model="editedRecord.name" class="form-input" />
            </div>

            <div class="form-group">
              <label><i class='bx bx-text'></i> Description</label>
              <div v-if="!isEditing" class="detail-value">{{ record.description || 'N/A' }}</div>
              <textarea v-else v-model="editedRecord.description" class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label><i class='bx bx-category'></i> Category</label>
              <div v-if="!isEditing" class="detail-value">{{ record.category || 'N/A' }}</div>
              <select v-else v-model="editedRecord.category" class="form-input">
                <option value="">Select Category</option>
                <option 
                  v-for="category in inventory_categories" 
                  :key="category._id" 
                  :value="category.category"
                >
                  {{ category.code + ' - ' + category.category }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label><i class='bx bx-layer'></i> Quantity</label>
              <div v-if="!isEditing" class="detail-value">{{ record.quantity }}</div>
              <input v-else type="number" v-model="editedRecord.quantity" min="0" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Financial Information Section -->
        <div class="detail-section">
          <h2 class="section-title">
            <i class='bx bx-dollar-circle'></i> Financial Information
          </h2>
          <div class="detail-grid">
            <div class="form-group">
              <label><i class='bx bx-calendar'></i> Purchase Date</label>
              <div v-if="!isEditing" class="detail-value">{{ formatDate(record.purchaseDate) }}</div>
              <input v-else type="date" v-model="formattedPurchaseDate" class="form-input" />
            </div>

            <div class="form-group">
              <label><i class='bx bx-purchase-tag'></i> Purchase Price</label>
              <div v-if="!isEditing" class="detail-value">${{ record.purchasePrice?.toFixed(2) }}</div>
              <div v-else class="input-with-symbol">
                <span class="symbol">$</span>
                <input type="number" v-model="editedRecord.purchasePrice" min="0" step="0.01" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label><i class='bx bx-line-chart'></i> Current Value</label>
              <div v-if="!isEditing" class="detail-value">${{ record.currentValue?.toFixed(2) }}</div>
              <div v-else class="input-with-symbol">
                <span class="symbol">$</span>
                <input type="number" v-model="editedRecord.currentValue" min="0" step="0.01" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Location & Condition Section -->
        <div class="detail-section">
          <h2 class="section-title">
            <i class='bx bx-map'></i> Location & Condition
          </h2>
          <div class="detail-grid">
            <div class="form-group">
              <label><i class='bx bx-location-plus'></i> Location</label>
              <div v-if="!isEditing" class="detail-value">{{ record.location || 'N/A' }}</div>
              <input v-else v-model="editedRecord.location" class="form-input" />
            </div>

            <div class="form-group">
    <label><i class='bx bx-check-shield'></i> Condition</label>
    <div v-if="!isEditing" class="detail-value">
      <span :class="['condition-badge', record.condition]">
        {{ formatCondition(record.condition) }}
      </span>
    </div>
    <select v-else v-model="editedRecord.condition" class="form-input">
      <option value="new">New</option>
      <option value="good">Good</option>
      <option value="needs-repair">Needs Repair</option>
    </select>
  </div>

          </div>
        </div>

        <!-- System Information Section -->
        <div class="detail-section">
          <h2 class="section-title">
            <i class='bx bx-chip'></i> System Information
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <label><i class='bx bx-calendar-plus'></i> Created At</label>
              <div class="detail-value">{{ formatDateTime(record.createdAt) }}</div>
            </div>
            <div class="info-item">
              <label><i class='bx bx-calendar-edit'></i> Modified At</label>
              <div class="detail-value">{{ formatDateTime(record.modifiedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showConfirmDelete" class="confirm-delete-overlay">
    <div class="confirm-delete-modal">
      <div class="delete-icon">
        <i class='bx bx-error-circle'></i>
      </div>
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete this inventory item? This action cannot be undone.</p>
      <div class="delete-actions">
        <button @click="deleteRecord" class="btn btn-danger">
          <i class='bx bx-trash'></i> Delete
        </button>
        <button @click="showConfirmDelete = false" class="btn btn-secondary">
          <i class='bx bx-x'></i> Cancel
        </button>
      </div>
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

const record = ref(null);
const isEditing = ref(false);
const showConfirmDelete = ref(false);
const editedRecord = ref({});
const formattedPurchaseDate = ref('');
const inventory_categories = ref([]);

// Initialize toastr
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-top-right',
  timeOut: 3000
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCondition = (condition) => {
  const conditions = {
    'new': 'New',
    'good': 'Good',
    'needs repair': 'Needs Repair'
  };
  return conditions[condition] || condition;
};

// Fetch categories from the database
const fetchInventoryCategories = async () => {
  try {
    const response = await axios.get('/api/inventory_category');
    inventory_categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toastr.error('Failed to load categories');
  }
};

onMounted(async () => {
  try {
    await fetchInventoryCategories();
    const response = await axios.get(`/api/inventory/detail/${route.params.id}`);
    record.value = response.data;
    editedRecord.value = { ...record.value };
    formattedPurchaseDate.value = formatDateForInput(record.value.purchaseDate);
  } catch (error) {
    console.error('Error loading inventory item:', error);
    toastr.error('Failed to load inventory details');
  }
});

// Format date to YYYY-MM-DD for input fields
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const toggleEdit = () => {
  if (isEditing.value) {
    updateRecord();
  } else {
    isEditing.value = true;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editedRecord.value = { ...record.value };
  formattedPurchaseDate.value = formatDateForInput(record.value.purchaseDate);
};

const updateRecord = async () => {
  try {
    // Update the purchase date before sending
    editedRecord.value.purchaseDate = formattedPurchaseDate.value;
    
    // Format numeric values
    if (editedRecord.value.purchasePrice) {
      editedRecord.value.purchasePrice = parseFloat(editedRecord.value.purchasePrice);
    }
    if (editedRecord.value.currentValue) {
      editedRecord.value.currentValue = parseFloat(editedRecord.value.currentValue);
    }
    
    await axios.put(`/api/inventory/${record.value._id}`, editedRecord.value);
    record.value = { ...editedRecord.value };
    isEditing.value = false;
    toastr.success('Inventory item updated successfully');
  } catch (error) {
    console.error('Error updating record:', error);
    toastr.error('Failed to update inventory item');
  }
};

const confirmDelete = () => {
  showConfirmDelete.value = true;
};

const deleteRecord = async () => {
  try {
    await axios.delete(`/api/inventory/${record.value._id}`);
    toastr.success('Inventory item deleted successfully');
    router.push('/inventory');
  } catch (error) {
    console.error('Error deleting record:', error);
    toastr.error('Failed to delete inventory item');
  } finally {
    showConfirmDelete.value = false;
  }
};
</script>

<style scoped>
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

.inventory-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-title i {
  font-size: 1.5em;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-card {
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

.detail-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.4rem;
  color: #4a6fa5;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f4f8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  font-size: 1.2em;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.info-item {
  margin-bottom: 1.2rem;
}

.form-group label,
.info-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a6fa5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-value {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  min-height: 20px;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.input-with-symbol {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-symbol .symbol {
  position: absolute;
  left: 10px;
  color: #6c757d;
}

.input-with-symbol .form-input {
  padding-left: 25px;
}

/* Condition Badges */
.condition-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
}

.condition-badge.new {
  background-color: #d4edda;
  color: #155724;
}

.condition-badge.good {
  background-color: #fff3cd;
  color: #856404;
}

.condition-badge.needs-repair {
  background-color: #f8d7da;
  color: #721c24;
}

/* Buttons */
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

.btn-primary {
  background: #4a6fa5;
  color: white;
}

.btn-primary:hover {
  background: #3a5a8f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 111, 165, 0.2);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.btn-outline {
  background: transparent;
  border: 1px solid #4a6fa5;
  color: #4a6fa5;
}

.btn-outline:hover {
  background: rgba(74, 111, 165, 0.1);
}

/* Delete Confirmation Modal */
.confirm-delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-delete-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.delete-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.confirm-delete-modal h3 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.confirm-delete-modal p {
  margin-bottom: 2rem;
  color: #6c757d;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .detail-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .inventory-detail-container {
    padding: 1rem;
  }
  
  .detail-card {
    padding: 1.5rem;
  }
  
  .delete-actions {
    flex-direction: column;
  }
  
  .delete-actions .btn {
    width: 100%;
  }
}
</style>