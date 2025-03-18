<template>
    <div class="record-detail">
      <div class="button-group">
        <button v-if="isEditing" @click="cancelEdit" class="back-button">Back</button>
        <button @click="toggleEdit" class="edit-button">
          {{ isEditing ? 'Submit' : 'Edit' }}
        </button>
        <button @click="confirmDelete" class="delete-button">Delete</button>
        <!-- Print Receipt Button -->
        <button 
                v-if="record && record.createReceipt" 
                @click="generateReceiptPDF" 
                class="print-button"
            >
                Print Receipt
            </button>
      </div>
      <h2>Record Details</h2>
      <div v-if="record">
        <div class="detail-field">
          <strong>Title:</strong>
          <span v-if="!isEditing">{{ record.title }}</span>
          <input v-else v-model="editedRecord.title" />
        </div>
        <div class="detail-field">
          <strong>Date:</strong>
          <span v-if="!isEditing">{{ formatDate(record.date) }}</span>
          <input v-else type="date" v-model="editedRecord.date" />
        </div>
        <div class="detail-field">
                <strong>Category:</strong>
                <span v-if="!isEditing">{{ record.category }}</span>
                <select v-else v-model="editedRecord.category">
                    <option v-for="category in categories" :key="category._id" :value="category.category">{{ category.category }}</option>
                </select>
            </div>
        <div class="detail-field">
          <strong>Person In Charge:</strong>
          <span v-if="!isEditing">{{ record.personInCharge }}</span>
        <select v-else
          id="personInCharge"
          v-model="editedRecord.personInCharge"
          :disabled="!isEditing"
        >
          <option v-for="admin in admins" :key="admin._id" :value="admin.english_name">
            {{ admin.english_name }}
          </option>
        </select>
        </div>
        <div class="detail-field">
          <strong>Fee Items:</strong>
         <!-- Fee Items Section -->
<div class="grid-container7x1">
  <div class="grid-item">
    <label for="feeItem">Fee Item *</label>
  </div>
  <div class="grid-item">
    <label for="service"></label>
  </div>
  <div class="grid-item">
    <label for="qty">QTY *</label>
  </div>
  <div class="grid-item">
    <label for="unitPrice">Unit $ *</label>
  </div>
  <div class="grid-item">
    <label for="discount">Discount (%)</label>
  </div>
  <div class="grid-item">
    <label for="amount">Amount</label>
  </div>
</div>
<div v-for="(item, index) in editedRecord.feeItems" :key="index" class="grid-container7x1">
  <div class="grid-item">
    <select v-if="isEditing" v-model="item.feeItem">
      <option>Event</option>
      <option>Service</option>
      <option>Goods</option>
      <option>Others</option>
    </select>
    <span v-else>{{ item.feeItem }}</span>
  </div>
  <div class="grid-item">
    <input v-if="isEditing" type="text" placeholder="Item Name" v-model="item.itemName" required />
    <span v-else>{{ item.itemName }}</span>
  </div>
  <div class="grid-item">
    <input v-if="isEditing" type="number" v-model="item.quantity" @input="calculateAmount(index)" min="1" required />
    <span v-else>{{ item.quantity }}</span>
  </div>
  <div class="grid-item">
    <input v-if="isEditing" type="number" v-model="item.unitPrice" @input="calculateAmount(index)" step="0.01" required />
    <span v-else>{{ item.unitPrice }}</span>
  </div>
  <div class="grid-item">
    <input v-if="isEditing" type="number" v-model="item.discount" @input="calculateAmount(index)" min="0" max="100" />
    <span v-else>{{ item.discount }}</span>
  </div>
  <div class="grid-item">
    <input v-if="isEditing" type="text" v-model="item.amount" readonly />
    <span v-else>{{ item.amount }}</span>
  </div>
  <div class="grid-item">
    <button v-if="isEditing" @click="deleteFeeItem(index)" class="delete-button">Delete</button>
  </div>
</div>
<button type="button" @click="addFeeItem" v-if="isEditing">Add Fee Items</button>
<div class="total-amount">
  <strong>Total Amount:</strong> ${{ isEditing ? calculateTotalAmount() : record.totalAmount }}
</div>
</div>

        <div class="detail-field">
          <strong>Remarks:</strong>
          <span v-if="!isEditing">{{ record.remarks }}</span>
          <textarea v-else v-model="editedRecord.remarks"></textarea>
        </div>
        <div class="detail-field">
          <strong>Create Receipt:</strong>
          <span v-if="!isEditing">{{ record.createReceipt ? 'Yes' : 'No' }}</span>
          <input v-else type="checkbox" v-model="editedRecord.createReceipt" />
        </div>
        <div class="detail-field">
          <strong>Issue Date:</strong>
          <span v-if="!isEditing">{{ record.issueDate ? formatDate(record.issueDate) : 'N/A' }}</span>
          <input v-else type="date" v-model="editedRecord.issueDate" />
        </div>
        <div class="detail-field">
          <strong>Bill To:</strong>
          <span v-if="!isEditing">{{ record.billTo || 'N/A' }}</span>
          <input v-else v-model="editedRecord.billTo" />
        </div>
        <div class="detail-field">
            <strong>Total Amount:</strong> ${{ isEditing ? calculateTotalAmount() : record.totalAmount }}

          
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
  import { useRoute,useRouter } from 'vue-router';
  import axios from 'axios';
  import jsPDF from 'jspdf'; 
  import html2canvas from 'html2canvas'; 
  import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 
  
  const route = useRoute();
  const router = useRouter();

  const record = ref(null);
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
const categories = ref([]); // Store fetched categories
const fetchCategories = async () => {
    try {
        const response = await axios.get('/api/finance_category'); // Adjust the endpoint as necessary
        categories.value = response.data; // Assuming the response contains an array of categories
    } catch (error) {
        console.error('Error fetching categories:', error);
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
      const response = await axios.get(`/api/income/detail/${recordId}`); // Fetch the record details
      record.value = response.data; // Set the record data
      editedRecord.value = { 
        ...record.value,
        date: formatDateForInput(record.value.date), // Set formatted date for editing
        issueDate: formatDateForInput(record.value.issueDate), // Set formatted issue date for editing
        feeItems: record.value.feeItems || [] // Initialize feeItems as an array
      }; // Initialize editedRecord with formatted dates
    } catch (error) {
      console.error('Error fetching record details:', error);
    }
  });
  onMounted(() => {
  fetchAdmins(); // Fetch admins when the component mounts
  fetchCategories();
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
      date: formatDateForInput(record.value.date), // Reset formatted date
      issueDate: formatDateForInput(record.value.issueDate) // Reset formatted issue date
    }; // Reset to original record with formatted dates
  };
  
  // Update record
  const updateRecord = async () => {
    try {
        editedRecord.value.totalAmount = parseFloat(calculateTotalAmount()); 
      await axios.put(`/api/income/detail/${record.value._id}`, editedRecord.value); // Update the record on the server
      record.value = { ...editedRecord.value }; // Update the local record
      localStorage.setItem('toastrMessage', 'Record Updated successfully!');
      const message = localStorage.getItem('toastrMessage');
if (message) {
    toastr.success(message);
    localStorage.removeItem('toastrMessage'); // Clear the message after displaying
}
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
      await axios.delete(`/api/income/detail/${record.value._id}`); // Delete the record from the server
      // Redirect or handle post-deletion logic here
      console.log('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      showConfirmDelete.value = false; // Close confirmation dialog
      localStorage.setItem('toastrMessage', 'Record deleted successfully!');
      router.push('/dashboard');
    }
  };

  const calculateAmount = (index) => {
  console.log(`Calculating amount for index: ${index}`);
  console.log(`Fee Items: `, editedRecord.value.feeItems);
  
  if (editedRecord.value.feeItems && editedRecord.value.feeItems[index]) {
    const item = editedRecord.value.feeItems[index];
    const total = (item.unitPrice * item.quantity) * (1 - (item.discount / 100));
    item.amount = total.toFixed(2);
  } else {
    console.error(`Fee item at index ${index} is undefined.`);
  }
};

const calculateTotalAmount = () => {
  return editedRecord.value.feeItems.reduce((total, item) => {
    return total + parseFloat(item.amount || 0);
  }, 0).toFixed(2); // Ensure the total is formatted to two decimal places
};


// Add a new fee item
const addFeeItem = () => {
  if (!editedRecord.value.feeItems) {
    editedRecord.value.feeItems = []; // Ensure feeItems is an array
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
        alert("You must have at least one fee item."); // Warning message
        return; // Prevent deletion
    }
  if (editedRecord.value.feeItems && editedRecord.value.feeItems[index]) {
    editedRecord.value.feeItems.splice(index, 1); // Remove the item at the specified index
  }
};

// Generate PDF from HTML template
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
    html2canvas(tempDiv, { scale: 2 }).then(canvas => { // Increase scale for better resolution
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 190; // Adjust based on your layout
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
        pdf.save(fileName); // Save the PDF

        // Clean up the temporary element
        document.body.removeChild(tempDiv);
    });
};

// Generate receipt HTML function
const generateReceiptHtml = (data) => {
    return `
        <html>
        <head>
            <title>Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Receipt</h1>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Date:</strong> ${formatDate(data.date)}</p>
            <p><strong>Person In Charge:</strong> ${data.personInCharge}</p>
            <p><strong>Bill To:</strong> ${data.billTo}</p>
            <p><strong>Issue Date:</strong> ${formatDate(data.issueDate)}</p>
            <h2>Fee Items</h2>
            <table>
                <thead>
                    <tr>
                        <th>Fee Item</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.feeItems.map(item => `
                        <tr>
                            <td>${item.feeItem}</td>
                            <td>${item.itemName}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unitPrice}</td>
                            <td>${item.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="total">Total Amount: $${data.totalAmount}</p>
            <p><strong>Remarks:</strong> ${data.remarks}</p>
        </body>
        </html>
    `;
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

.print-button {
    margin-left: 10px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #28a745; /* Green color for Print button */
    color: white;
}

.print-button:hover {
    background-color: #218838; /* Darker green on hover */
}

  </style>
  