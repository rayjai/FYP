<template>
    <div class="record-detail">
      <div class="button-group">
        <button v-if="isEditing" @click="cancelEdit" class="back-button">Back</button>
        <button @click="toggleEdit" class="edit-button">
          {{ isEditing ? 'Submit' : 'Edit' }}
        </button>
        <button @click="confirmDelete" class="delete-button">Delete</button>
      </div>
      <h2>Member Detail</h2>
      <div v-if="record">
        <div class="detail-field">
          <strong>Name:</strong>
          <span v-if="!isEditing">{{ record.english_name }}</span>
          <input v-else v-model="editedRecord.english_name" />
        </div>
        <div class="detail-field">
          <strong>Student Id:</strong>
          <span v-if="!isEditing">{{ record.student_id }}</span>
          <input v-else v-model="editedRecord.student_id" />
        </div>
   


        <div class="detail-field">
          <strong>Email:</strong>
          <span v-if="!isEditing">{{ record.email }}</span>
          <input v-else v-model="editedRecord.email" />
        </div>
        <div class="detail-field">
          <strong>Password:</strong>
          <span v-if="!isEditing">{{ record.password }}</span>
          <input v-else v-model="editedRecord.password" />
        </div>
        
        <div class="detail-field">
            <strong>Gender:</strong>
            <span v-if="!isEditing">{{ record.gender }}</span>
    <select v-else v-model="editedRecord.gender">
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="others">Others</option>
    </select>

          
        </div>
        <div class="detail-field">
          <strong>Access:</strong>
          <span v-if="!isEditing">{{ record.access ? 'Yes' : 'No' }}</span>
          <input v-else type="checkbox" v-model="editedRecord.access" />
        </div>
        <div class="detail-field">
          <strong>Created At:</strong> {{ formatDate(record.createdAt) }}
        </div>
        <div class="detail-field">
          <strong>Modified At:</strong> {{ formatDate(record.modifiedAt) }}
        </div>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
  
      <div v-if="showConfirmDelete" class="confirm-delete-overlay">
      <div class="confirm-delete-modal">
        <p>Are you sure you want to delete this record?</p>
        <button @click="deleteRecord">Yes</button>
        <button @click="showConfirmDelete = false">No</button>
      </div>
    </div>
    <h4>Registered Events</h4>
            <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 500px;"
            :columnDefs="memberColumnDefs"
            :rowData="transformedEvents"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef"
            @rowClicked="onRowClickedMember">
        </ag-grid-vue>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute,useRouter } from 'vue-router';
  import axios from 'axios';
  import { AgGridVue } from "ag-grid-vue3";

  
  const route = useRoute();
  const router = useRouter();

  const record = ref(null);
  const studentid = ref(null);
  const isEditing = ref(false);
  const showConfirmDelete = ref(false);
  const editedRecord = ref({});
  const admins = ref([]); // Store fetched admins
const selectedAdmin = ref(''); // For the create form

const fetchAdmins = async () => {
  try {
    const response = await fetch('/api/admins');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    admins.value = await response.json();
  } catch (error) {
    console.error('Error fetching admins:', error);
  }
};

   // Format the date to a more readable format
   const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
  };
  
  
  onMounted(async () => {
    const recordId = route.params.id; // Get the ID from the route
    try {
      const response = await axios.get(`/api/member/detail/${recordId}`); // Fetch the record details
      record.value = response.data; // Set the record data
      studentid.value = record.value.student_id;
      editedRecord.value = { 
        ...record.value,
        gender: record.value.gender
      }; // Initialize editedRecord with formatted dates
    } catch (error) {
      console.error('Error fetching record details:', error);
    }
    fetchRegisteredEvents();

  });

  const transformedEvents = ref([]);


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
    }
}


const memberColumnDefs = [
      { headerName: "Event Name", field: "event_name", sortable: true, filter: true },
      { headerName: "Attendance", field: "attendance", sortable: true, filter: true },
      
    ];

const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 100,
};

const filterRecords = () => {
      const query = searchQuery.value.toLowerCase();
      filteredIncomeRecords.value = incomeRecords.value.filter(record => {
        return record.personInCharge.toLowerCase().includes(query) ||
               record.remarks.toLowerCase().includes(query);
      });

      filteredExpenditureRecords.value = expenditureRecords.value.filter(record => {
        return record.personInCharge.toLowerCase().includes(query) ||
               record.remarks.toLowerCase().includes(query);
      });
    };

    function onRowClickedMember(event) {
    // Check if the click target is a print button
    if (event.event.target.classList.contains('print-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const id = event.event.target.getAttribute('data-id');
        handlePrint(id); // Call the print function
    } else {
        const recordId = event.data.event_id; // Assuming your record has an '_id' field
        console.log(event.data);
        router.push(`/event/detail/${recordId}`); // Navigate to the record page
    }
}
  onMounted(() => {
  fetchAdmins(); // Fetch admins when the component mounts
});
  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing.value) {
      // Submit changes
      updateRecord();
    }
    isEditing.value = !isEditing.value;
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    isEditing.value = false;
    editedRecord.value = { 
      ...record.value,
    }; // Reset to original record with formatted dates
  };
  
  // Update record
  const updateRecord = async () => {
    try {
      await axios.put(`/api/member/detail/${record.value._id}`, editedRecord.value); // Update the record on the server
      record.value = { ...editedRecord.value }; // Update the local record
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };
  
  // Confirm delete
  const confirmDelete = () => {
    showConfirmDelete.value = true;
  };
  
  // Delete record
  const deleteRecord = async () => {
    try {
      await axios.delete(`/api/member/detail/${record.value._id}`); // Delete the record from the server
      // Redirect or handle post-deletion logic here
      console.log('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      showConfirmDelete.value = false; // Close confirmation dialog
      router.push('/dashboard');
    }
  };

  

  </script>
  
  <style scoped>
  .record-detail {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .button-group {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  
  .edit-button, .back-button, .delete-button {
    margin-left: 10px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .edit-button {
    background-color: #007bff;
    color: white;
  }
  
  .back-button {
    background-color: #6c757d;
    color: white;
  }
  
  .delete-button {
    background-color: #dc3545;
    color: white;
  }
  
  h2 {
    text-align: center;
    color: #333;
  }
  
  .detail-field {
    margin-bottom: 15px;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .detail-field strong {
    color: #555;
  }
  
  ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  li {
    margin-bottom: 5px;
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
  z-index: 999; /* Ensure it covers other elements */
}

.confirm-delete-modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.confirm-delete-modal button {
  margin: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-delete-modal button:first-child {
  background-color: #dc3545; /* Yes button */
  color: white;
}

.confirm-delete-modal button:last-child {
  background-color: #6c757d; /* No button */
  color: white;
}

.grid-container7x1 {
    display: grid;
    grid-template-columns: 12% 20% 12% 12% 12% 12% 12%;
    gap: 10px;
}

.grid-item {
    display: flex;
    flex-direction: column;
}

label {
    margin-bottom: 5px;
}

input[type=text],
input[type=date],
input[type=number],
select {
    padding: 10px;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
}

input[type=text]:focus,
input[type=date]:focus,
input[type=number]:focus,
select:focus {
    border-color: #007bff;
    outline: none;
}
  </style>
  