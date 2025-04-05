<template>
    <div>
        <h2>Finance Categories</h2>
        <div class="action-buttons" style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
            <button class="btn btn-expenditure" @click="openFormModal">
                <i class='bx bx-dollar'></i> Add Finance Category
            </button>
        </div>
        <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 500px;"
            :columnDefs="ColumnDefs"
            :rowData="categoryRecords"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef">
        </ag-grid-vue>

        <div id="FormModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeFormModal">&times;</span>
                <h2>Add Finance Category</h2>

                <!-- Error message display -->
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

                <form @submit.prevent="handleSubmit"> <!-- Bind the submit event -->
                    <div class="form-group">
                        <label for="code">Code<span style="color: red;"> *</span></label>
                        <input type="text" id="code" v-model="club.code" required/>
                    </div>
                    <div class="form-group">
                        <label for="category">Category Name<span style="color: red;"> *</span></label>
                        <input type="text" id="category" v-model="club.category" required/>
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { AgGridVue } from "ag-grid-vue3";

const club = ref({
    code: '',
    category: ''
});
const errorMessage = ref(''); // Reactive error message

const route = useRoute();

const fetchClubInfo = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    try {
        const response = await axios.get(`/api/club/detail/${clubId}`);
        club.value = response.data; // Assuming the API returns the club object
    } catch (error) {
        console.error('Error fetching club info:', error);
    }
};

const handleSubmit = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    errorMessage.value = ''; // Reset error message
    try {
        const response = await axios.post(`/api/finance_category`, {
            code: club.value.code,
            category: club.value.category,
            clubId: clubId
        });
        closeFormModal();
        if (response.status === 200) {
            localStorage.setItem('toastrMessage', 'Finance Category added successfully!');
            window.location.href = '/dashboard';        
        }
    } catch (error) {
        console.error('Error setting category info:', error);
        if (error.response && error.response.status === 409) {
            errorMessage.value = 'Code/Name has already existed.'; // Set error message for duplicates
        } 
    }
};

const categoryRecords = ref([]);
const ColumnDefs = [
    { headerName: "Code", field: "code", sortable: true, filter: true },
    { headerName: "Category", field: "category", sortable: true, filter: true },
    { headerName: "Created At", field: "createdAt", sortable: true, filter: true },
];

const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 100,
};

const fetchCategoryRecords = async () => {
    try {
        const response = await axios.get('/api/finance_category'); // Adjust the endpoint as necessary
        categoryRecords.value = response.data; // Assuming the response contains an array of records
    } catch (error) {
        console.error('Error fetching income records:', error);
    }
};

function openFormModal() {
    document.getElementById("FormModal").style.display = "block";
}

function closeFormModal() {
    document.getElementById("FormModal").style.display = "none";
    errorMessage.value = ''; // Reset error message when closing modal
}

onMounted(() => {
    fetchClubInfo(); // Fetch the club information when the component mounts
    fetchCategoryRecords();
});
</script>

<style>
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 10px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button[type="submit"] {
    background-color: #4CAF50;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

/* Style for error message */
.error-message {
    color: red;
    margin-bottom: 10px;
}
</style>
