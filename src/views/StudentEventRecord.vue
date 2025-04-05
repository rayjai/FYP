<template>
    <Header />
    <div class="header-spacer"></div>

    <div class="profile-container">
        <div class="profile-card">
            <!-- Profile Header Section -->
            <div class="profile-header">
                <div class="avatar-container">
                    <div class="avatar-placeholder">
                        <i class='bx bx-user'></i>
                    </div>
                </div>
                <div class="profile-info-header">
                    <h2>{{ student.english_name }}</h2>
                    <p class="student-id">ID: {{ student.student_id }}</p>
                    <p class="student-email">{{ student.email }}</p>
                </div>
            </div>

            <!-- Registered Events Section -->
            <div class="events-section">
                <div class="section-header">
                    <h3><i class='bx bx-calendar-event'></i> Registered Events</h3>
                </div>
                <div class="ag-grid-container">
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
        </div>
    </div>

    <Footer />
</template>


<style scoped>
/* Base Styles */
.profile-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    min-height: calc(100vh - 160px);
}

.header-spacer {
    height: 80px;
}

.profile-card {
    width: 100%;
    max-width: 900px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* Profile Header Section */
.profile-header {
    display: flex;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    color: white;
    gap: 2rem;
}

.avatar-container {
    flex-shrink: 0;
}

.avatar-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
}

.profile-info-header {
    text-align: left;
}

.profile-info-header h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
}

.student-id, .student-email {
    margin: 0.3rem 0 0;
    font-size: 1rem;
    opacity: 0.9;
}

/* Events Section */
.events-section {
    padding: 2rem;
}

.section-header {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.4rem;
}

.section-header i {
    color: #4361ee;
    font-size: 1.6rem;
}

/* AG-Grid Container */
.ag-grid-container {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
    .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 1.5rem;
        gap: 1rem;
    }
    
    .profile-info-header {
        text-align: center;
    }
    
    .events-section {
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    .profile-container {
        padding: 1rem;
    }
    
    .profile-card {
        border-radius: 12px;
    }
    
    .avatar-placeholder {
        width: 80px;
        height: 80px;
        font-size: 2.5rem;
    }
    
    .profile-info-header h2 {
        font-size: 1.5rem;
    }
}
</style>

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
