<template>
    <div class="record-detail">
      <div class="button-group">
        <button v-if="isEditing" @click="cancelEdit" class="back-button">Back</button>
        <button @click="toggleEdit" class="edit-button">
          {{ isEditing ? 'Submit' : 'Edit' }}
        </button>
        <button @click="confirmDelete" class="delete-button">Delete</button>
      </div>
      <h2>Inventory Item Detail</h2>
      <div v-if="record">
        <div class="detail-field">
          <strong>Name:</strong>
          <span v-if="!isEditing">{{ record.name }}</span>
          <input v-else v-model="editedRecord.name" />
        </div>
        <div class="detail-field">
          <strong>Description:</strong>
          <span v-if="!isEditing">{{ record.description }}</span>
          <input v-else v-model="editedRecord.description" />
        </div>
        <div class="detail-field">
          <strong>Category:</strong>
          <span v-if="!isEditing">{{ record.category }}</span>
          <select v-else v-model="editedRecord.category">
            <option value="">All Categories</option>
            <option v-for="category in inventory_categories" :key="category._id" :value="category.category">
                {{ category.code + ' - ' +category.category  }}
            </option>
        </select>
        </div>
        <div class="detail-field">
          <strong>Quantity:</strong>
          <span v-if="!isEditing">{{ record.quantity }}</span>
          <input v-else type="number" v-model="editedRecord.quantity" />
        </div>
        <div class="detail-field">
          <strong>Purchase Date:</strong>
          <span v-if="!isEditing">{{ formatDate(record.purchaseDate) }}</span>
          <input v-else type="date" v-model="formattedPurchaseDate" />
        </div>
        <div class="detail-field">
          <strong>Purchase Price:</strong>
          <span v-if="!isEditing">{{ record.purchasePrice }}</span>
          <input v-else type="number" v-model="editedRecord.purchasePrice" />
        </div>
        <div class="detail-field">
          <strong>Current Value:</strong>
          <span v-if="!isEditing">{{ record.currentValue }}</span>
          <input v-else type="number" v-model="editedRecord.currentValue" />
        </div>
        <div class="detail-field">
          <strong>Location:</strong>
          <span v-if="!isEditing">{{ record.location }}</span>
          <input v-else v-model="editedRecord.location" />
        </div>
        <div class="detail-field">
          <strong>Condition:</strong>
          <span v-if="!isEditing">{{ record.condition }}</span>
          <select v-else v-model="editedRecord.condition">
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="needs repair">Needs Repair</option>
          </select>
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
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const router = useRouter();
  
  const record = ref(null);
  const isEditing = ref(false);
  const showConfirmDelete = ref(false);
  const editedRecord = ref({});
  const formattedPurchaseDate = ref('');
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const inventory_categories = ref([]); 
// Fetch categories from the database
const fetchInventoryCategories = async () => {
    try {
        const response = await axios.get('/api/inventory_category'); // Adjust the endpoint as necessary
        inventory_categories.value = response.data; // Assuming the response contains an array of categories
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};
  
  onMounted(async () => {
    const recordId = route.params.id; // Get the ID from the route
    try {
      const response = await axios.get(`/api/inventory/detail/${recordId}`); // Fetch the record details
      record.value = response.data; // Set the record data
      formattedPurchaseDate.value = formatDateForInput(record.value.purchaseDate);
      editedRecord.value = { ...record.value }; // Initialize editedRecord
    } catch (error) {
      console.error('Error fetching record details:', error);
    }
    fetchInventoryCategories();
  });
  
  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
  };
  
  const toggleEdit = () => {
    if (isEditing.value) {
      // Submit changes
      updateRecord();
    }
    isEditing.value = !isEditing.value;
  };
  
  const cancelEdit = () => {
    isEditing.value = false;
    editedRecord.value = { ...record.value }; // Reset to original record
  };
  
  const updateRecord = async () => {
    try {
      editedRecord.value.purchaseDate = formattedPurchaseDate.value; // Set the purchase date before sending
      await axios.put(`/api/inventory/${record.value._id}`, editedRecord.value); // Update the record on the server
      record.value = { ...editedRecord.value }; // Update the local record
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };
  
  const confirmDelete = () => {
    showConfirmDelete.value = true;
  };
  
  const deleteRecord = async () => {
    try {
      await axios.delete(`/api/inventory/${record.value._id}`); // Delete the record from the server
      localStorage.setItem('toastrMessage', 'Inventory record deleted successfully!');

      router.push('/dashboard'); // Redirect to inventory list or another page
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      showConfirmDelete.value = false; // Close confirmation dialog
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
  </style>
  