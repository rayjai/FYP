<template>
          <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

  <div class="record-detail-container">
    <div class="header">
      <h1>Record Details</h1>
      <div class="action-buttons">
        <button v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">
          <i class='bx bx-x'></i> Cancel
        </button>
        <button @click="toggleEdit" class="btn btn-primary">
          <i :class="isEditing ? 'bx bx-check' : 'bx bx-edit'"></i>
          {{ isEditing ? 'Save Changes' : 'Edit' }}
        </button>
        <button @click="confirmDelete" class="btn btn-danger">
          <i class='bx bx-trash'></i> Delete
        </button>
        <button 
          v-if="record && record.createReceipt" 
          @click="generateReceiptPDF" 
          class="btn btn-success"
        >
          <i class='bx bx-printer'></i> Print Receipt
        </button>
      </div>
    </div>

    <div class="record-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading record details...</p>
      </div>

      <div v-else-if="record" class="record-content">
        <!-- Basic Information Section -->
        <div class="detail-section">
          <h2 class="section-title">Basic Information</h2>
          <div class="detail-grid">
            <div class="form-group">
              <label>Title</label>
              <div v-if="!isEditing" class="detail-value">{{ record.title }}</div>
              <input v-else v-model="editedRecord.title" class="form-input" />
            </div>

            <div class="form-group">
              <label>Date</label>
              <div v-if="!isEditing" class="detail-value">{{ formatDate(record.date) }}</div>
              <input v-else type="date" v-model="editedRecord.date" class="form-input" />
            </div>

            <div class="form-group">
              <label>Category</label>
              <div v-if="!isEditing" class="detail-value">{{ record.category }}</div>
              <select v-else v-model="editedRecord.category" class="form-input">
                <option v-for="category in categories" :key="category._id" :value="category.category">
                  {{ category.category }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Person In Charge</label>
              <div v-if="!isEditing" class="detail-value">{{ record.personInCharge }}</div>
              <select v-else v-model="editedRecord.personInCharge" class="form-input">
                <option v-for="admin in admins" :key="admin._id" :value="admin.english_name">
                  {{ admin.english_name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Create Receipt</label>
              <div v-if="!isEditing" class="detail-value">{{ record.createReceipt ? 'Yes' : 'No' }}</div>
              <label v-else class="toggle-switch">
                <input type="checkbox" v-model="editedRecord.createReceipt" />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="form-group">
              <label>Issue Date</label>
              <div v-if="!isEditing" class="detail-value">{{ record.issueDate ? formatDate(record.issueDate) : 'N/A' }}</div>
              <input v-else type="date" v-model="editedRecord.issueDate" class="form-input" />
            </div>

            <div class="form-group">
              <label>Bill To</label>
              <div v-if="!isEditing" class="detail-value">{{ record.billTo || 'N/A' }}</div>
              <input v-else v-model="editedRecord.billTo" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Fee Items Section -->
        <div class="detail-section">
          <h2 class="section-title">Fee Items</h2>
          <div class="fee-items-table">
            <div class="table-header">
              <div class="header-cell">Fee Item</div>
              <div class="header-cell">Item Name</div>
              <div class="header-cell">Qty</div>
              <div class="header-cell">Unit Price</div>
              <div class="header-cell">Discount</div>
              <div class="header-cell">Amount</div>
              <div class="header-cell" v-if="isEditing">Action</div>
            </div>

            <div v-for="(item, index) in editedRecord.feeItems" :key="index" class="table-row">
              <div class="table-cell">
                <select v-if="isEditing" v-model="item.feeItem" class="form-input-sm">
                  <option>Event</option>
                  <option>Service</option>
                  <option>Goods</option>
                  <option>Others</option>
                </select>
                <span v-else>{{ item.feeItem }}</span>
              </div>
              <div class="table-cell">
                <input v-if="isEditing" type="text" v-model="item.itemName" class="form-input-sm" />
                <span v-else>{{ item.itemName }}</span>
              </div>
              <div class="table-cell">
                <input v-if="isEditing" type="number" v-model="item.quantity" @input="calculateAmount(index)" 
                  class="form-input-sm" min="1" />
                <span v-else>{{ item.quantity }}</span>
              </div>
              <div class="table-cell">
                <input v-if="isEditing" type="number" v-model="item.unitPrice" @input="calculateAmount(index)" 
                  class="form-input-sm" step="0.01" />
                <span v-else>{{ item.unitPrice }}</span>
              </div>
              <div class="table-cell">
                <input v-if="isEditing" type="number" v-model="item.discount" @input="calculateAmount(index)" 
                  class="form-input-sm" min="0" max="100" />
                <span v-else>{{ item.discount }}</span>
              </div>
              <div class="table-cell">
                <span>${{ item.amount }}</span>
              </div>
              <div class="table-cell" v-if="isEditing">
                <button @click="deleteFeeItem(index)" class="btn-icon danger">
                  <i class='bx bx-trash'></i>
                </button>
              </div>
            </div>

            <div v-if="isEditing" class="add-item-row">
              <button @click="addFeeItem" class="btn btn-sm btn-outline">
                <i class='bx bx-plus'></i> Add Item
              </button>
            </div>
          </div>

          <div class="total-amount">
            <strong>Total Amount:</strong> 
            <span>${{ isEditing ? calculateTotalAmount() : record.totalAmount }}</span>
          </div>
        </div>

        <!-- Remarks Section -->
        <div class="detail-section">
          <h2 class="section-title">Remarks</h2>
          <div v-if="!isEditing" class="detail-value">{{ record.remarks || 'N/A' }}</div>
          <textarea v-else v-model="editedRecord.remarks" class="form-textarea"></textarea>
        </div>

        <!-- Timestamps Section -->
        <div class="detail-section">
          <h2 class="section-title">System Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Created At</label>
              <div class="detail-value">{{ formatDate(record.createdAt) }}</div>
            </div>
            <div class="info-item">
              <label>Modified At</label>
              <div class="detail-value">{{ formatDate(record.modifiedAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class='bx bx-error-circle'></i>
        <p>No record details found</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showConfirmDelete" class="confirm-delete-overlay">
      <div class="confirm-delete-modal">
        <div class="delete-icon">
          <i class='bx bx-error-circle'></i>
        </div>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const route = useRoute();
const router = useRouter();

const record = ref(null);
const editedRecord = ref({});
const isEditing = ref(false);
const loading = ref(true);
const showConfirmDelete = ref(false);
const admins = ref([]);
const categories = ref([]);



const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const fetchAdmins = async () => {
  try {
    const response = await axios.get('/api/admins');
    admins.value = response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    toastr.error('Failed to load admin data');
  }
};

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/finance_category');
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toastr.error('Failed to load categories');
  }
};

onMounted(async () => {
  try {
    await fetchAdmins();
    await fetchCategories();
    
    const response = await axios.get(`/api/income/detail/${route.params.id}`);
    record.value = response.data;
    editedRecord.value = {
      ...record.value,
      date: formatDateForInput(record.value.date),
      issueDate: formatDateForInput(record.value.issueDate),
      feeItems: record.value.feeItems || []
    };
  } catch (error) {
    console.error('Error loading record:', error);
    toastr.error('Failed to load record details');
  } finally {
    loading.value = false;
  }
});

const toggleEdit = () => {
  if (isEditing.value) {
    updateRecord();
  }
  isEditing.value = !isEditing.value;
};

const cancelEdit = () => {
  isEditing.value = false;
  editedRecord.value = {
    ...record.value,
    date: formatDateForInput(record.value.date),
    issueDate: formatDateForInput(record.value.issueDate),
    feeItems: record.value.feeItems || []
  };
};

const updateRecord = async () => {
  try {
    editedRecord.value.totalAmount = parseFloat(calculateTotalAmount());
    await axios.put(`/api/income/detail/${record.value._id}`, editedRecord.value);
    record.value = { ...editedRecord.value };
    toastr.success('Record updated successfully');
  } catch (error) {
    console.error('Error updating record:', error);
    toastr.error('Failed to update record');
  }
};

const confirmDelete = () => {
  showConfirmDelete.value = true;
};

const deleteRecord = async () => {
  try {
    await axios.delete(`/api/income/detail/${record.value._id}`);
    toastr.success('Record deleted successfully');
    router.push('/dashboard');
  } catch (error) {
    console.error('Error deleting record:', error);
    toastr.error('Failed to delete record');
  } finally {
    showConfirmDelete.value = false;
  }
};

const calculateAmount = (index) => {
  if (editedRecord.value.feeItems && editedRecord.value.feeItems[index]) {
    const item = editedRecord.value.feeItems[index];
    const total = (item.unitPrice * item.quantity) * (1 - (item.discount / 100));
    item.amount = total.toFixed(2);
  }
};

const calculateTotalAmount = () => {
  return editedRecord.value.feeItems.reduce((total, item) => {
    return total + parseFloat(item.amount || 0);
  }, 0).toFixed(2);
};

const addFeeItem = () => {
  if (!editedRecord.value.feeItems) {
    editedRecord.value.feeItems = [];
  }
  editedRecord.value.feeItems.push({
    feeItem: '',
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    amount: 0,
  });
};

const deleteFeeItem = (index) => {
  if (editedRecord.value.feeItems.length <= 1) {
    toastr.warning('You must have at least one fee item');
    return;
  }
  if (editedRecord.value.feeItems && editedRecord.value.feeItems[index]) {
    editedRecord.value.feeItems.splice(index, 1);
  }
};

const generateReceiptPDF = () => {
  const receiptData = {
    title: record.value.title,
    date: record.value.date,
    personInCharge: record.value.personInCharge,
    feeItems: record.value.feeItems,
    remarks: record.value.remarks,
    totalAmount: record.value.totalAmount,
    issueDate: record.value.issueDate,
    billTo: record.value.billTo,
  };

  // Create receipt HTML
  const receiptHtml = generateReceiptHtml(receiptData);

  // Create a temporary element to hold the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = receiptHtml;
  document.body.appendChild(tempDiv);

  // Use html2canvas to capture the HTML
  html2canvas(tempDiv, { 
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `${formatDate(record.value.date)} - ${record.value.title}.pdf`;
    pdf.save(fileName);

    // Clean up the temporary element
    document.body.removeChild(tempDiv);
  });
};

const generateReceiptHtml = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4a6fa5; margin-bottom: 5px;">Receipt</h1>
        <p style="color: #6c757d;">${formatDate(data.issueDate)}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <p><strong>Title:</strong> ${data.title}</p>
          <p><strong>Date:</strong> ${formatDate(data.date)}</p>
          <p><strong>Person In Charge:</strong> ${data.personInCharge}</p>
        </div>
        <div>
          <p><strong>Bill To:</strong> ${data.billTo}</p>
          <p><strong>Receipt #:</strong> ${record.value._id}</p>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e9ecef;">Fee Item</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e9ecef;">Description</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e9ecef;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e9ecef;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e9ecef;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.feeItems.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.feeItem}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.itemName}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e9ecef;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e9ecef;">$${item.unitPrice}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e9ecef;">$${item.amount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="text-align: right; margin-top: 20px;">
        <div style="display: inline-block; text-align: left;">
          <p style="font-weight: bold; font-size: 1.1rem;">
            Total Amount: <span style="color: #4a6fa5;">$${data.totalAmount}</span>
          </p>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p><strong>Remarks:</strong> ${data.remarks || 'N/A'}</p>
      </div>
      
      <div style="margin-top: 50px; text-align: center; color: #6c757d; font-size: 0.9rem;">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `;
};
</script>

<style scoped>
/* [Previous styles remain exactly the same, no changes needed] */
.record-detail-container {
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

.action-buttons {
  display: flex;
  gap: 1rem;
}

.record-card {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.info-item {
  margin-bottom: 1rem;
}

.form-group label,
.info-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a6fa5;
}

.detail-value {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
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

.form-input-sm {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
}

/* Fee Items Table */
.fee-items-table {
  margin: 1.5rem 0;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 0.7fr 1fr 1fr 1fr 0.7fr;
  background-color: #f8f9fa;
  font-weight: 500;
  color: #4a6fa5;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 0.7fr 1fr 1fr 1fr 0.7fr;
  border-top: 1px solid #e9ecef;
}

.header-cell,
.table-cell {
  padding: 0.75rem;
  display: flex;
  align-items: center;
}

.add-item-row {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.total-amount {
  text-align: right;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.total-amount span {
  color: #4a6fa5;
  font-weight: 600;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #4a6fa5;
  color: #4a6fa5;
}

.btn-outline:hover {
  background: rgba(74, 111, 165, 0.1);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  color: #6c757d;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-icon:hover {
  background: #f8f9fa;
}

.btn-icon.danger {
  color: #dc3545;
}

.btn-icon.danger:hover {
  background: #f8d7da;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4a6fa5;
}

input:checked + .slider:before {
  transform: translateX(26px);
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
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 0.7fr 1fr;
  }
  
  .header-cell:nth-child(5),
  .header-cell:nth-child(6),
  .header-cell:nth-child(7),
  .table-cell:nth-child(5),
  .table-cell:nth-child(6),
  .table-cell:nth-child(7) {
    display: none;
  }
}

@media (max-width: 576px) {
  .record-detail-container {
    padding: 1rem;
  }
  
  .detail-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .header-cell:nth-child(3),
  .header-cell:nth-child(4),
  .table-cell:nth-child(3),
  .table-cell:nth-child(4) {
    display: none;
  }
}
</style>