<template>
    <Header />
    <div style="height: 80px;"></div>

    <div class="profile-container">
        <h2>Student Profile</h2>
        <div class="profile-header">
            <h3>{{ student.english_name }}</h3>
            <p>ID: {{ student.student_id }}</p>
        </div>

        <div class="profile-info">
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
    </div>

    <Footer />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { jwtDecode } from "jwt-decode";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { AgGridVue } from "ag-grid-vue3";
import { useRouter } from 'vue-router';  //useRoute

const router = useRouter();

const student = ref({});
const events = ref([]);

const getinfo = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        student.value = decoded.user;
    }
};

// Fetch registered events for the student
async function fetchRegisteredEvents() {
    try {
        if (student.value.student_id) {
            const response = await fetch(`/api/registrations/${student.value.student_id}`);
            const registrationData = await response.json();
            events.value = registrationData;
            console.log(registrationData);
            transformedEvents.value = registrationData.map(student => ({
                event_name: student.eventName,
                attendance: student.attendance !== undefined ? (student.attendance ? 'Present' : 'Absent') : 'N/A',
                event_id:student.event_id,
            }));
        }
    } catch (error) {
        console.error('Error fetching registered events:', error);
    }
}

const transformedEvents = ref([]);

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
    getinfo();
    fetchRegisteredEvents();
});
</script>

<style scoped>
.profile-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: center;
    /* Center text */
}

.profile-header {
    margin-bottom: 20px;
}

.avatar {
    width: 100px;
    /* Circle width */
    height: 100px;
    /* Circle height */
    border-radius: 50%;
    /* Circle shape */
    object-fit: cover;
    /* Maintain aspect ratio */
}

.profile-info,
.edit-profile {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-top: 10px;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
}

button {
    margin-top: 10px;
}
</style>
