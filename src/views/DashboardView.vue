<template>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    </link>
    <div v-if="isLoading" class="loading-animation">
           <Spinner />
        </div>
        <div v-else>
    <div class="navigation">
        <ul style="padding-left: 0px;">
            <li v-for="(item, index) in menuItems" :key="index" @mouseover="setHovered(index)"
                :class="{ hovered: hoveredIndex === index }">
                <a href="#" @click.prevent="item.action">
                    <span class="icon">
                        <i :class='item.icon'></i>
                    </span>
                    <span class="title">{{ item.title }}</span>
                </a>
            </li>
        </ul>
    </div>
    

    <div v-if="isDashboard">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <i class='bx bx-menu'></i>
                </div>

            

                <div class="user">
                    <img src="/src/assets/student_club1.png" alt="">
                </div>
            </div>

            <!-- ======================= Cards ================== -->
            <div class="cardBox">
                <div class="card" v-for="(card, index) in cards" :key="index">
                    <div>
                        <div class="numbers">{{ card.number }}</div>
                        <div class="cardName">{{ card.name }}</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon :name="card.icon"></ion-icon>
                    </div>
                </div>
            </div>

            <div class="holder">
  

                <!-- ================= New Customers ================ -->
                <div class="calendar">
                    <FullCalendar :options="calendarOptions" />
                </div>
            </div>
        </div>
    </div>
    <div v-if="isFinance">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <i class='bx bx-menu'></i>
                </div>

       

                <div class="user">
                    <img src="/src/assets/student_club1.png" alt="">
                </div>
            </div>

            <!-- ======================= Cards ================== -->
 

            <!-- ================ Expenditure Modal ================= -->

            <div id="invoiceExpenditureModal" class="modal">
    <div class="modal-content">
        <span class="close" @click="closeExpenditureModal">&times;</span>
        <h2>New Expenditure</h2>
        
        <form id="invoiceExForm" @submit.prevent="saveExpenditureRecord">
            <div class="form-group">
                <label for="Title">Title *</label>
                <input type="text" id="Title" required v-model="EXtitle">
            </div>
            <div class="form-group">
                <label for="Date">Date *</label>
                <input type="date" id="Date" required v-model="expenditureDate">
            </div>
            <div class="form-group">
                <label for="category">Select Category *</label>
                <select id="category" v-model="selectedExpenditureCategory" required>
                    <option v-for="category in categories" :key="category._id" :value="category.category">{{ category.category }}</option>
                </select>
            </div>
            <div class="form-group">
    <label for="pic">Person In Charge</label>
    <select id="pic" v-model="EXselectedAdmin">
                        <option v-for="admin in admins" :key="admin._id" :value="admin.english_name">{{ admin.english_name }}</option>
                    </select>
</div>
           
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
            <div v-for="(item, index) in EXfeeItems" :key="index" class="grid-container7x1">
                    <div class="grid-item">
                        <select v-model="item.feeItem">
                            <option>Event</option>
                            <option>Service</option>
                            <option>Goods</option>
                            <option>Others</option>
                        </select>
                    </div>
                    <div class="grid-item">
                        <input type="text" placeholder="Item Name" v-model="item.itemName" required>
                    </div>
                    <div class="grid-item">
                        <input type="number" v-model="item.quantity" @input="EXcalculateAmount(index)" min="1" required/>
                    </div>
                    <div class="grid-item">
                        <input type="number" v-model="item.unitPrice" @input="EXcalculateAmount(index)" step="0.01" required />
                    </div>
                    <div class="grid-item">
                        <input type="number" v-model="item.discount" @input="EXcalculateAmount(index)" min="0" max="100" />
                    </div>
                    <div class="grid-item">
                        <input type="text" v-model="item.amount" readonly />
                    </div>
                    <div class="grid-item">
        <button type="button" @click="deleteEXFeeItem(index)" class="delete-button">Delete</button>
    </div>
                </div>

                <button type="button" @click="addEXFeeItem">Add Fee Items</button>

                <div class="total-amount">
                    <strong>Total Amount: </strong>{{ EXtotalAmount }}
                </div>

                

            <h2>Others</h2>
            <div class="form-group">
                <label>Remarks</label>
                <textarea v-model="EXremarks"></textarea>
            </div>
            <button type="submit">Save</button>

        </form>
    </div>
</div>
            <!-- ================ Income modal ================= -->

<div id="invoiceIncomeModal" class="modal">
    <div class="modal-content">
        <span class="close" @click="closeIncomeModal">&times;</span>
        <h2>New Income</h2>
        
        <form id="invoiceForm" @submit.prevent="saveIncomeRecord">
            <div class="form-group">
                <label for="Title">Title *</label>
                <input type="text" id="Title" required v-model="title">
            </div>
            <div class="form-group">
                <label for="Date">Date *</label>
                <input type="date" id="Date" required v-model="incomeDate">
            </div>
            <div class="form-group">
                <label for="category">Select Category *</label>
                <select id="category" v-model="selectedIncomeCategory">
                    <option v-for="category in categories" :key="category._id" :value="category.category">{{ category.category }}</option>
                </select>
            </div>
            <div class="form-group">
    <label for="pic">Person In Charge</label>
    <select id="pic" v-model="selectedAdmin">
                        <option v-for="admin in admins" :key="admin._id" :value="admin.english_name">{{ admin.english_name }}</option>
                    </select>
</div>
           
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
            <div v-for="(item, index) in feeItems" :key="index" class="grid-container7x1">
                    <div class="grid-item">
                        <select v-model="item.feeItem">
                            <option>Event</option>
                            <option>Service</option>
                            <option>Goods</option>
                            <option>Others</option>
                        </select>
                    </div>
                    <div class="grid-item">
                        <input type="text" placeholder="Item Name" v-model="item.itemName" required>
                    </div>
                    <div class="grid-item">
                        <input type="number" v-model="item.quantity" @input="calculateAmount(index)" min="1" required/>
                    </div>
                    <div class="grid-item">
                        <input type="number" v-model="item.unitPrice" @input="calculateAmount(index)" step="0.01" required />
                    </div>
                    <div class="grid-item">
                        <input type="number" v-model="item.discount" @input="calculateAmount(index)" min="0" max="100" />
                    </div>
                    <div class="grid-item">
                        <input type="text" v-model="item.amount" readonly />
                    </div>
                    <div class="grid-item">
        <button type="button" @click="deleteFeeItem(index)" class="delete-button">Delete</button>
    </div>
                </div>

                <button type="button" @click="addFeeItem">Add Fee Items</button>

                <div class="total-amount">
                    <strong>Total Amount: </strong>{{ totalAmount }}
                </div>

                <h2>Receipt Information</h2>
                <div class="grid-container2x1">
                    <label for="createReceipt">Create a Receipt</label>
                    <input type="checkbox" id="createReceipt" v-model="createReceipt" style="width:20px">
                </div>

                <div v-if="createReceipt">
                    <div class="form-group">
                        <label for="issueDate">Issue Date</label>
                        <input type="date" id="issueDate" v-model="issueDate">
                    </div>
                    <div class="form-group">
                        <label for="billTo">Bill To</label>
                        <input type="text" id="billTo" v-model="billTo" placeholder="e.g MR. CHAN TAI MAN">
                    </div>
                </div>

            <h2>Others</h2>
            <div class="form-group">
                <label>Remarks</label>
                <textarea v-model="remarks"></textarea>
            </div>
            <button type="submit">Save</button>

        </form>
    </div>
</div>
            <!-- ================ Order Details List ================= -->
            <div class="holder">
                <h2>Transactions</h2>
    <!-- Add buttons positioned at the top right corner -->
    <div class="action-buttons" style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <button class="btn btn-expenditure" @click="openFinancialReportModal">
            <i class='bx bx-dollar'></i> Generate Financial Report
        </button>
    </div>
    
    <div v-if="IncomeRecord">
        <div>
    <label for="month">Month:</label>
    <select id="filterincomemonth">
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
    </select>

    <label for="year" style="margin-left: 20px;">Year:</label>
    <input type="number" id="filterincomeyear" value="2025" min="2000" max="2100">

    <button @click="fetchIncomeRecordsByDate" style="margin-left: 20px;">Apply Filter</button>
</div>
<div class="chart-container">    
    <canvas id="incomeChart" style="height: 400px; width: 100%;"></canvas>
    </div>
    </div>
    <div v-if="ExpenditureRecord">
        <div>
    <label for="month">Month:</label>
    <select id="filterexpendituremonth">
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
    </select>

    <label for="year" style="margin-left: 20px;">Year:</label>
    <input type="number" id="filterexpenditureyear" value="2025" min="2000" max="2100">

    <button @click="fetchExpenditureRecordsByDate" style="margin-left: 20px;">Apply Filter</button>
</div>
<div class="chart-container">    
    <canvas id="expenditureChart" style="height: 400px; width: 100%;"></canvas>
    </div>
    </div>
   <!-- Grouped Income and Expenditure Record Buttons -->
<div class="record-buttons" style="display: flex; justify-content: center; margin-bottom: 20px;">
    <button class="btn record-btn btn-expenditure" @click="openExpenditureRecord">
        <i class='bx bx-dollar'></i> Expenditure Record
    </button>
    <button class="btn record-btn btn-receivable" @click="openIncomeRecord">
        <i class='bx bx-receipt'></i> Income Record
    </button>
</div>


    <div v-if="IncomeRecord">
        <h3>Income Records</h3>
        <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 500px;"
            :columnDefs="columnDefs"
            :rowData="filteredIncomeRecords"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef"
            @rowClicked="onRowClickedIncome">
        </ag-grid-vue>
    </div>

    <div v-if="ExpenditureRecord">
        <h3>Expenditure Records</h3>
        <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 500px;"
            :columnDefs="expenditureColumnDefs"
            :rowData="filteredExpenditureRecords"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef"
            @rowClicked="onRowClickedExpenditure">
        </ag-grid-vue>
    </div>
</div>


        
        </div>

        <div id="app">
    <div class="fab-container">
        <div v-if="menuVisible" class="fab-menu">
            <button class="fab-option" @click="openExpenditureModal">
            <i class='bx bx-dollar'></i> New Expenditure
        </button>
            <button class="fab-option" @click="openIncomeModal">
            <i class='bx bx-receipt'></i> New Income
        </button>
        </div>
        <button class="fab" @click="toggleplusMenu">+</button>
        
    </div>
</div>
<div id="FinancialReportModal" class="modal">
    <div class="modal-content">
        <span class="close" @click="closeFinancialReportModal">&times;</span>
        <h2>Generate Report</h2>
        
        <form id="FinancialReportForm" @submit.prevent="saveFinancialReport">
          <div class="form-group">
            <label for="DateFrom">Date From *</label>
            <input type="date" id="DateFrom" required v-model="ReportDateFrom">
          </div>
          <div class="form-group">
            <label for="DateTo">Date To *</label>
            <input type="date" id="DateTo" required v-model="ReportDateTo">
          </div>
          <div class="form-group">
    <label for="category">Select Category:</label>
    <select id="category" v-model="selectedCategory">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category._id" :value="category.category">
            {{ category.category }}
        </option>
    </select>
</div>

          <button type="submit">Generate Report</button>
        </form>
    </div>
</div>

    </div>

    <div v-if="isMember">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <i class='bx bx-menu'></i>
                </div>



                <div class="user">
                    <img src="/src/assets/student_club1.png" alt="">
                </div>
            </div>
            
            <div class="holder">
                <h2>Members</h2>
                <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 500px;"
            :columnDefs="memberColumnDefs"
            :rowData="membersData"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef"
            @rowClicked="onRowClickedMember">
        </ag-grid-vue>
            </div>
        </div>
    </div>

    <div v-if="isSetting">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <i class='bx bx-menu'></i>
                </div>



                <div class="user">
                    <img src="/src/assets/student_club1.png" alt="">
                </div>
            </div>
            <div class="holder">
                <h2>Inventory</h2>
                <div class="action-buttons" style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <button class="btn btn-expenditure" @click="openInventoryModal">
            <i class='bx bx-book-content'></i> Add Inventory Item
        </button>
    </div>
    <div id="InventoryModal" class="modal">
    <div class="modal-content">
        <span class="close" @click="closeInventoryModal">&times;</span>
        <h2>Add Inventory Item</h2>
        
        <form id="InventoryForm" @submit.prevent="saveInventory">
            <div class="form-group">
        <label for="item-name">Item Name:</label>
        <input type="text" id="item-name" name="item-name" required v-model="inventory_itemName">
    </div>

    <div class="form-group">
        <label for="description">Description:</label>
        <textarea id="description" name="description" rows="4" v-model="inventory_description"></textarea>
    </div>
    <div class="form-group">
        <label for="category">Select Category:</label>
        <select id="category" v-model="inventory_selectedCategory">
            <option value="">All Categories</option>
            <option v-for="category in inventory_categories" :key="category._id" :value="category.category">
                {{ category.category }}
            </option>
        </select>
    </div>

    <!-- New fields added below -->
  


    <div class="form-group">
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" name="quantity" min="0" required v-model="inventory_quantity">
    </div>

    <div class="form-group">
        <label for="purchase-date">Purchase Date:</label>
        <input type="date" id="purchase-date" name="purchase-date" v-model="inventory_purchaseDate">
    </div>

    <div class="form-group">
        <label for="purchase-price">Purchase Price:</label>
        <input type="number" id="purchase-price" name="purchase-price" step="0.01" required v-model="inventory_purchasePrice">
    </div>

    <div class="form-group">
        <label for="current-value">Current Value:</label>
        <input type="number" id="current-value" name="current-value" step="0.01" required v-model="inventory_currentValue">
    </div>

    <div class="form-group">
        <label for="location">Location:</label>
        <input type="text" id="location" name="location" required v-model="inventory_location">
    </div>

    <div class="form-group">
        <label for="condition">Condition:</label>
        <select id="condition" name="condition" required v-model="inventory_condition">
            <option value="">Select Condition</option>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="needs repair">Needs Repair</option>
        </select>
    </div>



    <div class="form-group">
        <label for="notes">Remarks:</label>
        <textarea id="notes" name="notes" rows="3" v-model="inventory_remarks"></textarea>
    </div>

    <button type="submit">Add Inventory</button>
</form>

    </div>
</div>
                <ag-grid-vue
            class="ag-theme-alpine"
            style="width: 100%; height: 500px;"
            :columnDefs="memberColumnDefs"
            :rowData="membersData"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef"
            @rowClicked="onRowClickedMember">
        </ag-grid-vue>
            </div>
        </div>
    </div>
    <div v-if="isPassword">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <i class='bx bx-menu'></i>
                </div>



                <div class="user">
                    <img src="/src/assets/student_club1.png" alt="">
                </div>
            </div>
            <div class="setting-container">
                <h2>Settings</h2>
                <div class="settings-menu">
                    <button @click="ContentSetting = 'home'">Home</button>
                    <button @click="ContentSetting = 'about'">About Us</button>
                    <button @click="ContentSetting = 'others'">Finance Categories</button>
                    <button @click="ContentSetting = 'inventory_categories'">Inventory Categories</button>
                </div>

                <div class="settings-content">
                    <component :is="ContentComponent"></component>
                </div>
            </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed,watch } from 'vue';
import '@/assets/css/style.css'
import Spinner from '@/components/Spinner.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'vue-router';  //useRoute
import ProfileSettings from '@/views/ProfileSettings.vue';
import NotificationSettings from '@/views/NotificationSettings.vue';
import PrivacySettings from '@/views/PrivacySettings.vue';
import HomeSettings from '@/views/HomeSettings.vue';
import AboutUsSettings from '@/views/AboutUsSettings.vue';
import OthersSettings from '@/views/OthersSettings.vue';
import InventoryCategory from '@/views/InventoryCategory.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';
import { AgGridVue } from "ag-grid-vue3";
import jsPDF from 'jspdf'; 
import html2canvas from 'html2canvas'; 
import { nextTick } from 'vue';
import { Chart, LinearScale, CategoryScale, LineController, PointElement, LineElement } from 'chart.js';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; 
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 


// Register the scales and elements
Chart.register(LinearScale, CategoryScale, LineController, PointElement, LineElement);

// Handle event click
const handleEventClick = (info) => {
    router.push(`/event/detail/${info.event.id}`)
};
const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventClick: handleEventClick,
    eventRender: function(info) {
        // Custom rendering logic
        const element = info.el;
        element.style.backgroundColor = '#2196F3'; // Custom background color
        element.style.color = 'white'; // Custom text color
        element.style.borderRadius = '5px'; // Rounded corners
    },
    eventDidMount: function(info) {
        tippy(info.el, {
            content: info.event.title, // Tooltip content
            placement: 'top', // Tooltip position
        });
    },
});

const menuVisible = ref(false);

const toggleplusMenu = () => {
    menuVisible.value = !menuVisible.value;
};


// Fetch events from your API
const fetchEvents = async () => {
    try {
        const response = await fetch('/api/events'); // Replace with your API endpoint
        const data = await response.json();
        const events = data.events || []; // Get the events array
        calendarOptions.value.events = events.map(event => ({
            id:event._id,
            title: event.eventName,
            start: event.eventDateFrom, // Adjust according to your data structure
            end: event.eventDateTo, // Optional
        }));
console.log('Mapped events:', calendarOptions.value.events);

    } catch (error) {
        console.error('Error fetching events:', error);
    }
};



const router = useRouter();

const memberCount = ref(0); // Reactive variable to store member count
const totalIncome = ref(0);
const totalExpenditure = ref(0);

const earnings = computed(() => {
    return totalIncome.value - totalExpenditure.value;
});

const fetchMemberCount = async () => {
    try {
        const response = await axios.get('/api/members/count');
        memberCount.value = response.data.count; // Set the member count
    } catch (error) {
        console.error('Error fetching member count:', error);
    }
};
const fetchEarning = async () => {
    try {
        const incomeResponse = await axios.get('/api/totalincome');
        totalIncome.value = incomeResponse.data.totalIncome;

        const expenditureResponse = await axios.get('/api/totalexpenditure');
        totalExpenditure.value = expenditureResponse.data.totalExpenditure;
    } catch (error) {
        console.error('Error fetching totals:', error);
    }
};

const totalCommentsCount = ref(0); // Reactive variable to store total comment count

const fetchTotalCommentsCount = async () => {
    try {
        const response = await axios.get('/api/posts/comments/count');
        totalCommentsCount.value = response.data.totalCommentsCount; // Set the total comment count
    } catch (error) {
        console.error('Error fetching total comments count:', error);
    }
};
const todayRegistrationCount = ref(0); // Reactive variable to store today's registration count

const fetchTodayRegistrationCount = async () => {
    try {
        const response = await axios.get('/api/registrations/today/count');
        todayRegistrationCount.value = response.data.count; // Set the count
    } catch (error) {
        console.error('Error fetching today\'s registration count:', error);
    }
};

const membersData = ref([]);

const data = [
    [1, 2],
    [3, 4],
];

const menuItems = ref([
    { title: 'Student Club', icon: 'bx bx-desktop', action: () => router.push('/home') },
    { title: 'Dashboard', icon: 'bx bx-home', action: GoDashboard },
    { title: 'Members', icon: 'bx bxs-group', action: GoMember },
    { title: 'Finance', icon: 'bx bx-dollar-circle', action: GoFinance },
    { title: 'Inventory', icon: 'bx bx-book-content', action: GoSetting },
    { title: 'Settings', icon: 'bx bx-cog', action: GoPassword },
]);

const cards = ref([
    { number: todayRegistrationCount, name: 'Daily Event Registered', icon: 'eye-outline' },
    { number: memberCount, name: 'Members', icon: 'cart-outline' },
    { number: totalCommentsCount, name: 'Comments', icon: 'chatbubbles-outline' },
    { number: earnings.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), name: 'Earnings', icon: 'cash-outline' },
]);

const customers = ref([
    { img: '/src/assets/student_club1.png', name: 'David', country: 'Italy' },
    { img: '/src/assets/student_club2.png', name: 'Amit', country: 'India' },
]);

watch([totalIncome, totalExpenditure], () => {
    cards.value[3].number = earnings.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
});

const hoveredIndex = ref(null);
const isActive = ref(false);

function setHovered(index) {
    hoveredIndex.value = index;
}

function toggleMenu() {
    isActive.value = !isActive.value;
}


const currentSetting = ref('profile'); // Default setting to show
const ContentSetting = ref('home')

const currentSettingComponent = computed(() => {
    switch (currentSetting.value) {
        case 'profile':
            return ProfileSettings;
        case 'notification':
            return NotificationSettings;
        case 'privacy':
            return PrivacySettings;
        default:
            return ProfileSettings; // Fallback
    }
});
const ContentComponent = computed(() => {
    switch (ContentSetting.value) {
        case 'home':
            return HomeSettings;
        case 'about':
            return AboutUsSettings;
        case 'others':
            return OthersSettings;

        case 'inventory_categories':
            return InventoryCategory;
        default:
            return HomeSettings; // Fallback
    }
});


const searchQuery = ref('');
const incomeRecords = ref([]);
const filteredIncomeRecords = ref([]);
const expenditureRecords = ref([]);
const filteredExpenditureRecords = ref([]);
const IncomeRecord = ref(true);
const ExpenditureRecord = ref(false);


const columnDefs = [
{
        headerName: "Date",
        field: "date",
        sortable: true,
        filter: true,
        valueGetter: params => {
            return formatDate(params.data.date); // Format the date here
        }
    },    { headerName: "Title", field: "title", sortable: true, filter: true },
    { headerName: "Total Amount", field: "totalAmount", sortable: true, filter: true },
    { headerName: "Remarks", field: "remarks", sortable: true, filter: true },
    {
        headerName: "Receipt",
        field: "createReceipt",
        cellRenderer: params => {
            // Check if createReceipt is true
            if (params.value) {
                return `<button class="print-button" data-id="${params.data._id}">Print</button>`;
            } else {
                return `<button class="print-button disabled" disabled>Unavailable</button>`;
            }
        },
        sortable: false,
        filter: false
    },];

    async function handlePrint(id) {
    try {
        const response = await fetch(`/api/income/detail/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch record details');
        }
        const data = await response.json();
        generateReceiptPDF(data);
    } catch (error) {
        console.error('Error fetching record details:', error);
        alert('Could not fetch record details for printing.');
    }
}

function onRowClickedIncome(event) {
    // Check if the click target is a print button
    if (event.event.target.classList.contains('print-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const id = event.event.target.getAttribute('data-id');
        handlePrint(id); // Call the print function
    } else {
        const recordId = event.data._id; // Assuming your record has an '_id' field
        router.push(`/incomerecord/${recordId}`); // Navigate to the record page
    }
}
function onRowClickedMember(event) {
    // Check if the click target is a print button
    if (event.event.target.classList.contains('print-button')) {
        event.event.stopPropagation(); // Prevent row click propagation
        const id = event.event.target.getAttribute('data-id');
        handlePrint(id); // Call the print function
    } else {
        const recordId = event.data._id; // Assuming your record has an '_id' field
        console.log(event.data);
        router.push(`/memberdetail/${recordId}`); // Navigate to the record page
    }
}


// Function to generate the PDF
const generateReceiptPDF = (data) => {
    const receiptHtml = generateReceiptHtml(data);

    // Create a temporary element to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = receiptHtml;
    document.body.appendChild(tempDiv);

    // Use html2canvas to capture the HTML
    html2canvas(tempDiv, { scale: 2 }).then(canvas => {
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

        const fileName = `${formatDate(data.date)} - ${data.title}.pdf`;
        pdf.save(fileName); // Save the PDF

        // Clean up the temporary element
        document.body.removeChild(tempDiv);
    });
};

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to generate receipt HTML
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

const expenditureColumnDefs = [
      { 
        headerName: "Date",
        field: "date",
        sortable: true,
        filter: true,
        valueGetter: params => {
            return formatDate(params.data.date); // Format the date here
        }
    }, 
      { headerName: "Title", field: "title", sortable: true, filter: true },
      { headerName: "Total Amount", field: "totalAmount", sortable: true, filter: true },
      { headerName: "Remarks", field: "remarks", sortable: true, filter: true },
      { headerName: "Created At", field: "createdAt", sortable: true, filter: true },
    ];

const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 100,
};

const fetchIncomeRecords = async () => {
    try {
        const response = await axios.get('/api/income'); // Adjust the endpoint as necessary
        incomeRecords.value = response.data; // Assuming the response contains an array of records
        filteredIncomeRecords.value = incomeRecords.value; // Initialize filtered records
    } catch (error) {
        console.error('Error fetching income records:', error);
    }
};
const fetchExpenditureRecords = async () => {
      try {
        const response = await axios.get('/api/expenditure'); // Adjust the endpoint as necessary
        expenditureRecords.value = response.data; // Assuming the response contains an array of records
        filteredExpenditureRecords.value = expenditureRecords.value; // Initialize filtered records
      } catch (error) {
        console.error('Error fetching expenditure records:', error);
      }
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

    

async function fetchMembers() {
    try {
        const response = await fetch('/api/members');
        const data = await response.json();
         membersData.value = data.students.map(student => ({
            english_name: student.english_name,
            student_id: student.student_id,
            email: student.email,
            gender: student.gender,
            _id: student._id,
        }));
    } catch (error) {
        console.error('Error fetching home events:', error);
    }
};

const memberColumnDefs = [
      { headerName: "Name", field: "english_name", sortable: true, filter: true },
      { headerName: "Student Id", field: "student_id", sortable: true, filter: true },
      { headerName: "Email", field: "email", sortable: true, filter: true },
      { headerName: "Gender", field: "gender", sortable: true, filter: true },
    ];
const admins = ref([]);
const selectedAdmin = ref('');
const EXselectedAdmin = ref('');


// Function to fetch admins from the backend
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

async function fetchIncomeRecordsChart(month, year) {
  const response = await fetch(`/api/income_records?month=${month}&year=${year}`);
  return response.json();
}

function aggregateIncome(records) {
    const incomeByDay = {};
    records.forEach(record => {
        // Parse issueDate directly
        const date = new Date(record.date); // Use record.issueDate directly
        const day = date.getUTCDate(); // Use getUTCDate() for consistency
        const amount = record.totalAmount;

        // Check if day is a valid number
        if (!isNaN(day)) {
            if (!incomeByDay[day]) {
                incomeByDay[day] = 0;
            }
            incomeByDay[day] += amount;
        } else {
            console.error('Invalid date:', record.date); // Log invalid dates
        }
    });
    return incomeByDay;
}


// Method to prepare chart data
function prepareChartData(incomeByDay, daysInMonth) {
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const data = labels.map(day => incomeByDay[day] || 0);
  return { labels, data };
}

watch(isFinance, (newValue) => {
    if (newValue) {
        renderIncomeChart(); // Call renderChart when isFinance is activated
    }
});
let incomeChart = null; // Store the chart instance

async function renderIncomeChart() {
    const month = 3; // March
    const year = 2025;
    const records = await fetchIncomeRecordsChart(month, year);
    
    console.log('Fetched Records:', records); // Check fetched records

    // Aggregate income records by day
    const incomeByDay = aggregateIncome(records);
    console.log('Aggregated Income by Day:', incomeByDay); // Check aggregation

    // Calculate the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Prepare chart data
    const { labels, data } = prepareChartData(incomeByDay, daysInMonth);
    console.log('Chart Labels:', labels); // Check labels
    console.log('Chart Data:', data); // Check data

    const ctx = document.getElementById('incomeChart');
    if (!ctx) {
        console.error('Canvas element not found!');
        return; // Exit early if the canvas is not found
    }

    const context = ctx.getContext('2d');

     incomeChart = new Chart(context, {
        responsive: true,
        maintainAspectRatio: true,
        type: 'line',
        data: {
            labels: labels, // Use prepared labels
            datasets: [{
                label: 'Income Flow',
                data: data, // Use prepared data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category', // Specify the scale type for x-axis
                },
                y: {
                    type: 'linear', // Specify the scale type for y-axis
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Income Records for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
                    font: {
                        size: 18
                    },
                }
            }
        }
    });
}
async function renderFilterIncomeChart(month,year) {
    await deleteFilterIncomeChart(); // Delete any existing chart

    const filterincomemonth = month; // March
    const filterincomeyear = year;
    const records = await fetchIncomeRecordsChart(filterincomemonth, filterincomeyear);
    
    console.log('Fetched Records:', records); // Check fetched records

    // Aggregate income records by day
    const incomeByDay = aggregateIncome(records);
    console.log('Aggregated Income by Day:', incomeByDay); // Check aggregation

    // Calculate the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Prepare chart data
    const { labels, data } = prepareChartData(incomeByDay, daysInMonth);
    console.log('Chart Labels:', labels); // Check labels
    console.log('Chart Data:', data); // Check data

    const ctx = document.getElementById('incomeChart');
    if (!ctx) {
        console.error('Canvas element not found!');
        return; // Exit early if the canvas is not found
    }


    const context = ctx.getContext('2d');

    incomeChart = new Chart(context, {
        responsive: true,
    maintainAspectRatio: true,
        type: 'line',
        data: {
            labels: labels, // Use prepared labels
            datasets: [{
                label: 'Income Flow',
                data: data, // Use prepared data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category', // Specify the scale type for x-axis
                },
                y: {
                    type: 'linear', // Specify the scale type for y-axis
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Expenditure Records for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
                    font: {
                        size: 18
                    }
                }
            }
        }
    });

}


async function deleteFilterIncomeChart() {
    if (incomeChart instanceof Chart) { // Check if incomeChart is a Chart instance
        incomeChart.destroy(); // Destroy the existing chart instance
        incomeChart = null; // Clear the reference
        console.log('Chart deleted.');
    } else {
        console.log('No chart to delete or it is not a valid Chart instance.');
    }
}



const fetchIncomeRecordsByDate = async () => {
    const month = parseInt(document.getElementById('filterincomemonth').value, 10);
    const year = parseInt(document.getElementById('filterincomeyear').value, 10);
    await renderFilterIncomeChart(month, year);
};
async function fetchExpenditureRecordsChart(month, year) {
  const response = await fetch(`/api/expenditure_records?month=${month}&year=${year}`);
  return response.json();
}

function aggregateExpenditure(records) {
    const incomeByDay = {};
    records.forEach(record => {
        // Parse issueDate directly
        const date = new Date(record.date); // Use record.issueDate directly
        const day = date.getUTCDate(); // Use getUTCDate() for consistency
        const amount = record.totalAmount;

        // Check if day is a valid number
        if (!isNaN(day)) {
            if (!incomeByDay[day]) {
                incomeByDay[day] = 0;
            }
            incomeByDay[day] += amount;
        } else {
            console.error('Invalid date:', record.date); // Log invalid dates
        }
    });
    return incomeByDay;
}


watch(isFinance, (newValue) => {
    if (newValue) {
        renderExpenditureChart(); // Call renderChart when isFinance is activated
    }
});
let expenditureChart = null; // Store the chart instance

async function renderExpenditureChart() {
    const month = 3; // March
    const year = 2025;
    const records = await fetchExpenditureRecordsChart(month, year);
    
    console.log('Fetched Records:', records); // Check fetched records

    // Aggregate income records by day
    const incomeByDay = aggregateExpenditure(records);
    console.log('Aggregated Income by Day:', incomeByDay); // Check aggregation

    // Calculate the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Prepare chart data
    const { labels, data } = prepareChartData(incomeByDay, daysInMonth);
    console.log('Chart Labels:', labels); // Check labels
    console.log('Chart Data:', data); // Check data

    const ctx = document.getElementById('expenditureChart');
    if (!ctx) {
        console.error('Canvas element not found!');
        return; // Exit early if the canvas is not found
    }

    const context = ctx.getContext('2d');

     expenditureChart = new Chart(context, {
        responsive: true,
        maintainAspectRatio: true,
        type: 'line',
        data: {
            labels: labels, // Use prepared labels
            datasets: [{
                label: 'Income Flow',
                data: data, // Use prepared data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category', // Specify the scale type for x-axis
                },
                y: {
                    type: 'linear', // Specify the scale type for y-axis
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Expenditure Records for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
                    font: {
                        size: 18
                    }
                }
            }
        }
    });
}
async function renderFilterExpenditureChart(month,year) {
    await deleteFilterExpenditureChart(); // Delete any existing chart

    const filterincomemonth = month; // March
    const filterincomeyear = year;
    const records = await fetchExpenditureRecordsChart(filterincomemonth, filterincomeyear);
    
    console.log('Fetched Records:', records); // Check fetched records

    // Aggregate income records by day
    const incomeByDay = aggregateExpenditure(records);
    console.log('Aggregated Income by Day:', incomeByDay); // Check aggregation

    // Calculate the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Prepare chart data
    const { labels, data } = prepareChartData(incomeByDay, daysInMonth);
    console.log('Chart Labels:', labels); // Check labels
    console.log('Chart Data:', data); // Check data

    const ctx = document.getElementById('expenditureChart');
    if (!ctx) {
        console.error('Canvas element not found!');
        return; // Exit early if the canvas is not found
    }

    const context = ctx.getContext('2d');

     expenditureChart = new Chart(context, {
        responsive: true,
    maintainAspectRatio: true,
        type: 'line',
        data: {
            labels: labels, // Use prepared labels
            datasets: [{
                label: 'Income Flow',
                data: data, // Use prepared data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category', // Specify the scale type for x-axis
                },
                y: {
                    type: 'linear', // Specify the scale type for y-axis
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Income Records for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
                    font: {
                        size: 18
                    }
                }
            }
        }
    });
}


async function deleteFilterExpenditureChart() {
    if (expenditureChart instanceof Chart) { // Check if incomeChart is a Chart instance
        expenditureChart.destroy(); // Destroy the existing chart instance
        expenditureChart = null; // Clear the reference
        console.log('Chart deleted.');
    } else {
        console.log('No chart to delete or it is not a valid Chart instance.');
    }
}



const fetchExpenditureRecordsByDate = async () => {
    const month = parseInt(document.getElementById('filterexpendituremonth').value, 10);
    const year = parseInt(document.getElementById('filterexpenditureyear').value, 10);
    await renderFilterExpenditureChart(month, year);
};

const categories = ref([]); 
// Fetch categories from the database
const fetchCategories = async () => {
    try {
        const response = await axios.get('/api/finance_category'); // Adjust the endpoint as necessary
        categories.value = response.data; // Assuming the response contains an array of categories
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
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
const isLoading = ref(true); // Loading state

const fetchData = async () => {
    await Promise.all([
        fetchMembers(),
        fetchMemberCount(),
        fetchTotalCommentsCount(),
        fetchTodayRegistrationCount(),
        fetchAdmins(),
        fetchIncomeRecords(),
        fetchExpenditureRecords(),
        fetchEarning(),
        renderIncomeChart(),
        renderExpenditureChart(),
        fetchEvents(),
        fetchCategories(),
        fetchInventoryCategories()
    ]);
};

onMounted(async () => {
    await fetchData();
    isLoading.value = false; // Set loading to false after all data is fetched
});

const title = ref('');
const incomeDate = ref('');
const selectedIncomeCategory=ref('');
const feeItems = ref([{ feeItem: '', itemName: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }]);
const remarks = ref('');
const createReceipt = ref(false);
const issueDate = ref('');
const billTo = ref('');

const calculateAmount = (index) => {
    const item = feeItems.value[index];
    const discountMultiplier = (100 - item.discount) / 100;
    item.amount = (item.unitPrice * item.quantity * discountMultiplier).toFixed(2);
};

// Add a new fee item
const addFeeItem = () => {
    feeItems.value.push({ feeItem: '', itemName: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 });
};

// Delete a fee item
const deleteFeeItem = (index) => {
    if (feeItems.value.length <= 1) {
        alert("You must have at least one fee item."); // Warning message
        return; // Prevent deletion
    }
    if (feeItems.value && feeItems.value[index]) {
        feeItems.value.splice(index, 1); // Remove the item at the specified index
        calculateTotalAmount(); // Recalculate the total amount after deletion
    }
};

// Calculate total amount
const calculateTotalAmount = () => {
    return feeItems.value.reduce((total, item) => total + parseFloat(item.amount || 0), 0).toFixed(2);
};

// Total amount computed property
const totalAmount = computed(() => {
    return calculateTotalAmount(); // Call the function to get the total
});

const saveIncomeRecord = async () => {
    const recordData = {
        title: title.value,
        date: incomeDate.value,
        category: selectedIncomeCategory.value,
        personInCharge: selectedAdmin.value,
        feeItems: feeItems.value,
        remarks: remarks.value,
        createReceipt: createReceipt.value,
        issueDate: issueDate.value,
        billTo: billTo.value,
        totalAmount: parseFloat(totalAmount.value),
    };

    try {
        const response = await fetch('/api/income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData),
        });

        if (!response.ok) {
            throw new Error('Failed to save income record');
        }

        const result = await response.json();
// Before redirecting
localStorage.setItem('toastrMessage', 'Income record added successfully!');
window.location.href = '/dashboard';

    } catch (error) {
        console.error('Error saving income record:', error);
        // Optionally, show an error message to the user
    }
};

// On the dashboard page
const message = localStorage.getItem('toastrMessage');
if (message) {
    toastr.success(message);
    localStorage.removeItem('toastrMessage'); // Clear the message after displaying
}


const EXtitle = ref('');
const expenditureDate = ref('');
const selectedExpenditureCategory = ref('');
const EXfeeItems = ref([{ feeItem: '', itemName: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }]);
const EXremarks = ref('');

// Calculate amount based on unit price, quantity, and discount for a specific item
const EXcalculateAmount = (index) => {
    const item = EXfeeItems.value[index];
    const discountMultiplier = (100 - item.discount) / 100;
    item.amount = (item.unitPrice * item.quantity * discountMultiplier).toFixed(2);
};

// Add a new fee item
const addEXFeeItem = () => {
    EXfeeItems.value.push({ feeItem: '', itemName: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 });
};




const deleteEXFeeItem = (index) => {
    if (EXfeeItems.value.length <= 1) {
        alert("You must have at least one fee item."); // Warning message
        return; // Prevent deletion
    }
    if (EXfeeItems.value && EXfeeItems.value[index]) {
        EXfeeItems.value.splice(index, 1); // Remove the item at the specified index
        calculateTotalAmount(); // Recalculate the total amount after deletion
    }
};

// Calculate total amount
const calculateEXTotalAmount = () => {
    return EXfeeItems.value.reduce((total, item) => total + parseFloat(item.amount || 0), 0).toFixed(2);
};

// Total amount computed property
const EXtotalAmount = computed(() => {
    return calculateEXTotalAmount(); // Call the function to get the total
});



const saveExpenditureRecord = async () => {
    const recordData = {
        title: EXtitle.value,
        date: expenditureDate.value,
        category: selectedExpenditureCategory.value,
        personInCharge: EXselectedAdmin.value,
        feeItems: EXfeeItems.value,
        remarks: EXremarks.value,
        totalAmount: EXtotalAmount.value,
    };

    try {
        const response = await fetch('/api/expenditure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData),
        });

        if (!response.ok) {
            throw new Error('Failed to save expenditure record');
        }

        const result = await response.json();
        localStorage.setItem('toastrMessage', 'Expenditure record added successfully!');        
        window.location.href = '/dashboard';

    } catch (error) {
        console.error('Error saving expenditure record:', error);
        // Optionally, show an error message to the user
    }
};

    function openExpenditureModal() {
        document.getElementById("invoiceExpenditureModal").style.display = "block";
    }

    function closeExpenditureModal() {
        document.getElementById("invoiceExpenditureModal").style.display = "none";
    }

    function openIncomeModal() {
        document.getElementById("invoiceIncomeModal").style.display = "block";
    }

    function closeIncomeModal() {
        document.getElementById("invoiceIncomeModal").style.display = "none";
    }

    function openFinancialReportModal() {
        document.getElementById("FinancialReportModal").style.display = "block";
    }

    function closeFinancialReportModal() {
        document.getElementById("FinancialReportModal").style.display = "none";
    }
    function openInventoryModal() {
        document.getElementById("InventoryModal").style.display = "block";
    }

    function closeInventoryModal() {
        document.getElementById("InventoryModal").style.display = "none";
    }

    function openExpenditureRecord(){
        IncomeRecord.value = false;
        ExpenditureRecord.value = true;
        fetchExpenditureRecords();
        renderExpenditureChart();
    }
    function openIncomeRecord(){
        IncomeRecord.value = true;
        ExpenditureRecord.value = false;
        fetchIncomeRecords();
        renderIncomeChart();
    }

  
const onRowClickedExpenditure = (event) => {
  const recordId = event.data._id; // Assuming your record has an 'id' field
  router.push(`/expenditurerecord/${recordId}`);};

  const ReportDateFrom = ref('');
const ReportDateTo = ref('');
const reportIncomeRecords = ref([]);
const reportExpenditureRecords = ref([]);


const selectedCategory = ref(''); // Reactive variable for selected category

const fetchFinancialData = async (dateFrom, dateTo) => {
    await fetchIncomeRecords();
    await fetchExpenditureRecords();

    // Filter and sort income records by date range and category
    reportIncomeRecords.value = incomeRecords.value
        .filter(record => {
            const recordDate = new Date(record.date);
            const isInDateRange = recordDate >= new Date(dateFrom) && recordDate <= new Date(dateTo);
            const isInCategory = selectedCategory.value ? record.category === selectedCategory.value : true; // Check category
            return isInDateRange && isInCategory;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

    // Filter and sort expenditure records by date range and category
    reportExpenditureRecords.value = expenditureRecords.value
        .filter(record => {
            const recordDate = new Date(record.date);
            const isInDateRange = recordDate >= new Date(dateFrom) && recordDate <= new Date(dateTo);
            const isInCategory = selectedCategory.value ? record.category === selectedCategory.value : true; // Check category
            return isInDateRange && isInCategory;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending
};



const saveFinancialReport = async () => {
    const dateFrom = ReportDateFrom.value;
    const dateTo = ReportDateTo.value;

    // Fetch financial data based on the selected date range
    await fetchFinancialData(dateFrom, dateTo);

    // Generate PDF
    await createPDF(dateFrom, dateTo);

    // Close the modal after generating the report
    closeFinancialReportModal();
};

const formatReportDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const createPDF = async (dateFrom, dateTo) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text('Financial Report', 10, 20);
    doc.setFontSize(12);
    doc.text(`Date From: ${dateFrom}`, 10, 30);
    doc.text(`Date To: ${dateTo}`, 10, 40);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45); // Horizontal line

    // Income Records
    doc.setFontSize(16);
    doc.text('Income Details:', 10, 55);
    doc.setFontSize(12);
    
    // Table Header
    doc.text('Date', 10, 65);
    doc.text('Title', 60, 65);
    doc.text('Amount', 140, 65);
    doc.setLineWidth(0.5);
    doc.line(10, 68, 200, 68); // Horizontal line

    let incomeY = 73; // Starting Y position for income records
    reportIncomeRecords.value.forEach((income) => {
        doc.text(formatReportDate(income.date), 10, incomeY);
        doc.text(income.title, 60, incomeY);
        doc.text(`$${income.totalAmount.toFixed(2)}`, 140, incomeY);
        incomeY += 8; // Increment Y position for next record
    });

    // Total Income
    const totalIncome = reportIncomeRecords.value.reduce((sum, record) => sum + record.totalAmount, 0);
    doc.setFontSize(14);
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 10, incomeY);
    incomeY += 10; // Space after total

    // Expenditure Records
    doc.setFontSize(16);
    doc.text('Expenditure Details:', 10, incomeY);
    doc.setFontSize(12);
    
    // Table Header
    doc.text('Date', 10, incomeY + 10);
    doc.text('Title', 60, incomeY + 10);
    doc.text('Amount', 140, incomeY + 10);
    doc.setLineWidth(0.5);
    doc.line(10, incomeY + 13, 200, incomeY + 13); // Horizontal line

    let expenditureY = incomeY + 17; // Starting Y position for expenditure records
    reportExpenditureRecords.value.forEach((expenditure) => {
        doc.text(formatReportDate(expenditure.date), 10, expenditureY);
        doc.text(expenditure.title, 60, expenditureY);
        doc.text(`$${expenditure.totalAmount.toFixed(2)}`, 140, expenditureY);
        expenditureY += 8; // Increment Y position for next record
    });

    // Total Expenditure
    const totalExpenditure = reportExpenditureRecords.value.reduce((sum, record) => sum + record.totalAmount, 0);
    doc.setFontSize(14);
    doc.text(`Total Expenditure: $${totalExpenditure.toFixed(2)}`, 10, expenditureY);
    expenditureY += 10; // Space after total

    // Final Summary
    doc.setFontSize(16);
    doc.text('Summary:', 10, expenditureY);
    doc.setFontSize(14);
    doc.text(`Net Income: $${(totalIncome - totalExpenditure).toFixed(2)}`, 10, expenditureY + 10);

    // Save the PDF
    doc.save(`Financial_Report_${dateFrom}_to_${dateTo}.pdf`);
};


</script>

<script>
export default {
    name: 'App',
    components: {
        FullCalendar,
    },
    methods: {
        handleDateClick: function (arg) {
            alert('date click! ' + arg.dateStr)
        },
    }
}

let isDashboard = ref(true);
let isFinance = ref(false);
let isMember = ref(false);
let isSetting = ref(false);
let isPassword = ref(false);




let GoHome = () => {
    router.push('/');
};

const GoDashboard = () => {
    isDashboard.value = true;
    isFinance.value = false;
    isMember.value = false;
    isSetting.value = false;
    isPassword.value = false;
};

const GoFinance = () => {
    isDashboard.value = false;
    isFinance.value = true;
    isMember.value = false;
    isSetting.value = false;
    isPassword.value = false;
};

const GoMember = () => {
    isDashboard.value = false;
    isMember.value = true;
    isFinance.value = false;
    isSetting.value = false;
    isPassword.value = false;
};

const GoSetting = () => {
    isDashboard.value = false;
    isSetting.value = true;
    isFinance.value = false;
    isMember.value = false;
    isPassword.value = false;
};

const GoPassword = () => {
    isDashboard.value = false;
    isPassword.value = true;
    isFinance.value = false;
    isMember.value = false;
    isSetting.value = false;
};
</script>
<style>
/* Add any additional styles here */
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.action-buttons {
    display: flex;
    justify-content: space-around; /* Space buttons evenly */
    margin: 20px 0; /* Add some margin */
}

.btn {
    padding: 15px 30px; /* Add padding */
    font-size: 14px; /* Increase font size */
    border: none; /* Remove border */
    border-radius: 5px; /* Rounded corners */
    cursor: pointer; /* Pointer cursor */
    color: white; /* Text color */
}

.btn-expenditure {
    background-color: #28a745; /* Green for expenditure */
}

.btn-receivable {
    background-color: #007bff; /* Blue for receivable */
}



    .modal {
        display: none;
        position: fixed;
        z-index: 1050;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgb(0, 0, 0);
        background-color: rgba(0, 0, 0, 0.4);
        padding-top: 60px;
    }

    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        z-index: 1060;
    }

    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }



    .form-group label {
        display: block;
        margin-bottom: 5px;
    }
    h1 {
    text-align: center;
    color: #333;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
}
.grid-container2x1 {
    display: grid;
    grid-template-columns: repeat(2, 50%);
    gap: 10px;
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

button {
    padding: 10px;
    background-color: #ff7f50;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #e66a3f;
}

h2 {
    margin-top: 20px;
    color: #555;
}

hr {
    margin: 20px 0;
    border-color: #eee;
}
.dropdown-results {
    border: 1px solid #ccc;
    max-height: 150px;
    overflow-y: auto;
    display: none; /* Hidden by default */
}

.dropdown-results div {
    padding: 8px;
    cursor: pointer;
}

.dropdown-results div:hover {
    background-color: #f0f0f0;
}

.total-amount {
    margin-top: 10px;
    font-size: 1.2em;
    font-weight: bold;
}
.holder{
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 20px;
}
.action-buttons {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.record-buttons {
    display: flex;
    justify-content: center; /* Center the buttons */
    margin-bottom: 20px; /* Space below the buttons */
}

.record-btn {
    background-color: #003366; /* Dark blue background */
    color: white; /* White text */
    border: none; /* Remove default border */
    padding: 10px 20px; /* Add padding */
    border-radius: 5px; /* Rounded corners */
    font-size: 16px; /* Font size */
    margin: 0 10px; /* Space between buttons */
    transition: all 0.3s ease; /* Smooth transition */
    cursor: pointer; /* Pointer cursor on hover */
}

.record-btn:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Hover shadow effect */
    transform: translateY(-2px); /* Slight lift effect */
}
.print-button {
    background-color: #007bff; /* Bootstrap primary color */
    color: white;
    border: none;
    padding: 3px 8px; /* Reduced padding */
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px; /* Smaller font size */
    line-height: 2; /* Adjust line height */
}
.print-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
}
.print-button.disabled {
    background-color: #ccc; /* Grey background for disabled state */
    color: #666; /* Grey text */
    cursor: not-allowed; /* Change cursor to indicate unclickable */
}
.chart-container {
    width: 100%; /* Full width */
    height:500px;
}
#expenditureChart{
    width: 100%; /* Full width */
    height:400px;
}
/* Custom styles for FullCalendar */
.fc {
    font-family: 'Arial', sans-serif; /* Change to your preferred font */
}

.fc-toolbar {
    background-color: white; /* Header background color */
    color: white; /* Header text color */
    padding: 10px; /* Add some padding */
}

.fc-daygrid-event {
    background-color: #2196F3; /* Event background color */
    color: white; /* Event text color */
    border-radius: 5px; /* Rounded corners */
    padding: 5px; /* Padding inside events */
}

.fc-daygrid-event:hover {
    background-color: #1976D2; /* Darker shade on hover */
}

.fc-day {
    border: 1px solid #e0e0e0; /* Add borders to days */
}

.fc-day:hover {
    background-color: #f5f5f5; /* Highlight day on hover */
}
.calendar {
  position: relative;
  min-height: 400px;
  width: 100%;
  padding: 20px;
  background: var(--white);
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  border-radius: 20px;
}
.fab-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.fab {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #4CAF50; /* Change to your preferred color */
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s;
}

.fab:hover {
    background-color: #45a049; /* Darker shade on hover */
}

.fab-menu {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
}

.fab-option {
    width: 200px;
    padding: 10px;
    border-radius: 5px;
    background-color: #ffffff; /* Background color for options */
    color: #333; /* Text color */
    border: 1px solid #ccc;
    cursor: pointer;
    margin-bottom: 5px;
    transition: background-color 0.3s;
}

.fab-option:hover {
    background-color: #f1f1f1; /* Change background on hover */
}
.loading-animation {
    /* Add your loading animation styles here */
    text-align: center;
    font-size: 20px;
    margin-top: 50px;
}
</style>