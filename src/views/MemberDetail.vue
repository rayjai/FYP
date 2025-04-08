<template>
  <div class="member-detail-container">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

    <div class="member-header">
      <h1 class="member-title">Member Details</h1>
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
      </div>
    </div>

    <div class="member-card">
      <div v-if="record" class="member-content">
        <div class="detail-section">
          <h3 class="section-title">Basic Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Name</label>
              <div v-if="!isEditing" class="detail-field">{{ record.english_name }}</div>
              <input v-else v-model="editedRecord.english_name" class="form-input" />
            </div>

            <div class="form-group">
              <label>Student ID</label>
              <div v-if="!isEditing" class="detail-field">{{ record.student_id }}</div>
              <input v-else v-model="editedRecord.student_id" class="form-input" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <div v-if="!isEditing" class="detail-field">{{ record.email }}</div>
              <input v-else v-model="editedRecord.email" type="email" class="form-input" />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <div v-if="!isEditing" class="detail-field">{{ record.phoneNo || 'N/A' }}</div>
              <input v-else v-model="editedRecord.phoneNo" class="form-input" />
            </div>

            <div class="form-group">
              <label>Username</label>
              <div v-if="!isEditing" class="detail-field">{{ record.username }}</div>
              <input v-else v-model="editedRecord.username" class="form-input" />
            </div>

            <div class="form-group">
              <label>Gender</label>
              <div v-if="!isEditing" class="detail-field">{{ record.gender || 'N/A' }}</div>
              <select v-else v-model="editedRecord.gender" class="form-input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div class="form-group">
              <label>Access</label>
              <div v-if="!isEditing" class="detail-field">{{ record.access ? 'Granted' : 'Restricted' }}</div>
              <label v-else class="toggle-switch">
                <input type="checkbox" v-model="editedRecord.access" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
  <label>Expiry Date</label>
  <div v-if="!isEditing" class="detail-field">
    {{ record.expiry_date ? formatDate(record.expiry_date) : 'N/A' }}
  </div>
  <input 
    v-else 
    v-model="editedRecord.expiry_date" 
    type="date" 
    class="form-input"
  />
</div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">System Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Created At</label>
              <div class="detail-field">{{ formatDate(record.createdAt) }}</div>
            </div>
            <div class="info-item">
              <label>Modified At</label>
              <div class="detail-field">{{ formatDate(record.modifiedAt) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">Registered Events</h3>
          <div class="ag-grid-container">
            <ag-grid-vue
            style="width: 100%; height: 500px;"
              class="ag-theme-alpine"
              :columnDefs="memberColumnDefs"
              :rowData="transformedEvents"
              :pagination="true"
              :paginationPageSize="10"
              :defaultColDef="defaultColDef"
              @rowClicked="onRowClickedMember"
            ></ag-grid-vue>
          </div>
        </div>
      </div>
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Loading member details...</p>
      </div>
    </div>

    <div v-if="showConfirmDelete" class="confirm-delete-overlay">
      <div class="confirm-delete-modal">
        <div class="delete-icon">
          <i class='bx bx-error-circle'></i>
        </div>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this member? This action cannot be undone.</p>
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
import { AgGridVue } from "ag-grid-vue3";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const route = useRoute();
const router = useRouter();

const record = ref(null);
const studentid = ref(null);
const isEditing = ref(false);
const showConfirmDelete = ref(false);
const editedRecord = ref({});
const transformedEvents = ref([]);

const memberColumnDefs = [
  { headerName: "Event Name", field: "event_name", sortable: true, filter: true, flex: 2 },
  { headerName: "Attendance", field: "attendance", sortable: true, filter: true, flex: 1 },
];

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(async () => {
  const recordId = route.params.id;
  try {
    const response = await axios.get(`/api/member/detail/${recordId}`);
    record.value = response.data;
    studentid.value = record.value.student_id;
    editedRecord.value = { 
      ...record.value,
      gender: record.value.gender,
      access: record.value.access,
      expiry_date: record.value.expiry_date ? formatDateForInput(record.value.expiry_date) : ''

    };
    fetchRegisteredEvents();
  } catch (error) {
    console.error('Error fetching record details:', error);
    toastr.error('Failed to load member details');
  }
});
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

async function fetchRegisteredEvents() {
  const recordId = studentid.value;
  try {
    const response = await fetch(`/api/registrations/${recordId}`);
    const registrationData = await response.json();
    transformedEvents.value = registrationData.map(student => ({
      event_name: student.eventName,
      attendance: student.attendance !== undefined ? (student.attendance ? 'Present' : 'Absent') : 'N/A',
      event_id: student.event_id,
    }));
  } catch (error) {
    console.error('Error fetching registered events:', error);
    toastr.error('Failed to load registered events');
  }
}

function onRowClickedMember(event) {
  if (event.event.target.classList.contains('print-button')) {
    event.event.stopPropagation();
    const id = event.event.target.getAttribute('data-id');
    handlePrint(id);
  } else {
    const recordId = event.data.event_id;
    router.push(`/event/detail/${recordId}`);
  }
}

const toggleEdit = () => {
  if (isEditing.value) {
    updateRecord();
  }
  isEditing.value = !isEditing.value;
};

const cancelEdit = () => {
  isEditing.value = false;
  editedRecord.value = { ...record.value };
};

const updateRecord = async () => {
  try {
    await axios.put(`/api/member/detail/${record.value._id}`, editedRecord.value);
    record.value = { ...editedRecord.value };
    toastr.success('Member information updated successfully');
  } catch (error) {
    console.error('Error updating record:', error);
    toastr.error('Failed to update member information');
  }
};

const confirmDelete = () => {
  showConfirmDelete.value = true;
};

const deleteRecord = async () => {
  try {
    await axios.delete(`/api/member/detail/${record.value._id}`);
    toastr.success('Member deleted successfully');
    router.push('/dashboard');
  } catch (error) {
    console.error('Error deleting record:', error);
    toastr.error('Failed to delete member');
  } finally {
    showConfirmDelete.value = false;
  }
};

// Initialize toastr options
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-top-right',
  timeOut: 3000
};
</script>

<style scoped>
.member-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.member-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.member-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.member-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group, .info-item {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a6fa5;
}

.detail-field {
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

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
}

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

.ag-grid-container {
  width: 100%;
  height: 500px;
  margin-top: 1rem;
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

@media (max-width: 768px) {
  .member-header {
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
  
  .form-grid, .info-grid {
    grid-template-columns: 1fr;
  }
  
  .confirm-delete-modal {
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