<template>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    </link>
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

                <div class="search">
                    <label>
                        <input type="text" placeholder="Search here">
                    </label>
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

            <!-- ================ Order Details List ================= -->
            <div class="details">
                <div class="recentOrders">
                    <div class="cardHeader">
                        <h2>Recent Orders</h2>
                        <a href="#" class="btn">View All</a>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Price</td>
                                <td>Payment</td>
                                <td>Status</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(order, index) in orders" :key="index">
                                <td>{{ order.name }}</td>
                                <td>{{ order.price }}</td>
                                <td>{{ order.payment }}</td>
                                <td><span :class="['status', order.status]">{{ order.statusText }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- ================= New Customers ================ -->
                <div class="recentCustomers">
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

                <div class="search">
                    <label>
                        <input type="text" placeholder="Search here">
                        <ion-icon name="search-outline"></ion-icon>
                    </label>
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

    <!-- Add buttons positioned at the top right corner -->
    <div class="action-buttons" style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <button class="btn btn-expenditure" @click="openExpenditureModal">
            <i class='bx bx-dollar'></i> New Expenditure
        </button>
        <button class="btn btn-receivable" @click="openIncomeModal" style="margin-left: 10px;">
            <i class='bx bx-receipt'></i> New Income
        </button>
    </div>
    <h2>Transactions</h2>


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
            :columnDefs="columnDefs"
            :rowData="filteredExpenditureRecords"
            :pagination="true"
            :paginationPageSize="10"
            :defaultColDef="defaultColDef"
            @rowClicked="onRowClickedExpenditure">
        </ag-grid-vue>
    </div>
</div>


        
        </div>
    </div>

    <div v-if="isMember">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <i class='bx bx-menu'></i>
                </div>

                <div class="search">
                    <label>
                        <input type="text" placeholder="Search here">
                        <ion-icon name="search-outline"></ion-icon>
                    </label>
                </div>

                <div class="user">
                    <img src="/src/assets/student_club1.png" alt="">
                </div>
            </div>
            <h2>Members</h2>
            <div class="details">
                <DataTable :value="membersData" :paginator="true" :rows="10">
                    <Column field="english_name" header="Name" />
                    <Column field="student_id" header="Student ID" />
                </DataTable>
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
            <div class="setting-container">
                <h2>Settings</h2>
                <div class="settings-menu">
                    <button @click="currentSetting = 'profile'">Profile</button>
                    <button @click="currentSetting = 'notification'">Notifications</button>
                    <button @click="currentSetting = 'privacy'">Privacy</button>
                </div>

                <div class="settings-content">
                    <component :is="currentSettingComponent"></component>
                </div>
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
                </div>

                <div class="settings-content">
                    <component :is="ContentComponent"></component>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed,watch } from 'vue';
import '@/assets/css/style.css'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'vue-router';  //useRoute
import ProfileSettings from '@/views/ProfileSettings.vue';
import NotificationSettings from '@/views/NotificationSettings.vue';
import PrivacySettings from '@/views/PrivacySettings.vue';
import HomeSettings from '@/views/HomeSettings.vue';
import AboutUsSettings from '@/views/AboutUsSettings.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';
import { AgGridVue } from "ag-grid-vue3";



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
    { title: 'Settings', icon: 'bx bx-cog', action: GoSetting },
    { title: 'Web Content', icon: 'bx bx-book-content', action: GoPassword },
]);

const cards = ref([
    { number: todayRegistrationCount, name: 'Daily Event Registered', icon: 'eye-outline' },
    { number: memberCount, name: 'Members', icon: 'cart-outline' },
    { number: totalCommentsCount, name: 'Comments', icon: 'chatbubbles-outline' },
    { number: earnings.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), name: 'Earnings', icon: 'cash-outline' },
]);

const orders = ref([
    { name: 'Star Refrigerator', price: '$1200', payment: 'Paid', status: 'delivered', statusText: 'Delivered' },
    { name: 'Dell Laptop', price: '$110', payment: 'Due', status: 'pending', statusText: 'Pending' },
    { name: 'Apple Watch', price: '$1200', payment: 'Paid', status: 'return', statusText: 'Return' },
    { name: 'Addidas Shoes', price: '$620', payment: 'Due', status: 'inProgress', statusText: 'In Progress' },
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
    { headerName: "Date", field: "date", sortable: true, filter: true },
    { headerName: "Title", field: "title", sortable: true, filter: true },
    { headerName: "Total Amount", field: "totalAmount", sortable: true, filter: true },
    { headerName: "Remarks", field: "remarks", sortable: true, filter: true },
    { headerName: "Created At", field: "createdAt", sortable: true, filter: true },
];
const expenditureColumnDefs = [
      { headerName: "Date", field: "date", sortable: true, filter: true },
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
        }));
    } catch (error) {
        console.error('Error fetching home events:', error);
    }
};

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

onMounted(() => {
    fetchMembers();
    fetchMemberCount();
    fetchTotalCommentsCount();
    fetchTodayRegistrationCount();
    fetchAdmins();
    fetchIncomeRecords();
    fetchExpenditureRecords();
    fetchEarning();
})

const title = ref('');
const incomeDate = ref('');
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
        personInCharge: selectedAdmin.value,
        feeItems: feeItems.value,
        remarks: remarks.value,
        createReceipt: createReceipt.value,
        issueDate: issueDate.value,
        billTo: billTo.value,
        totalAmount: totalAmount.value,
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
        console.log('Income record saved successfully:', result);
        window.location.href = '/dashboard';

    } catch (error) {
        console.error('Error saving income record:', error);
        // Optionally, show an error message to the user
    }
};

const EXtitle = ref('');
const expenditureDate = ref('');
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
        console.log('Expenditure record saved successfully:', result);
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

    function openExpenditureRecord(){
        IncomeRecord.value = false;
        ExpenditureRecord.value = true;
        fetchExpenditureRecords();
    }
    function openIncomeRecord(){
        IncomeRecord.value = true;
        ExpenditureRecord.value = false;
        fetchIncomeRecords();
    }

    const onRowClickedIncome = (event) => {
  const recordId = event.data._id; // Assuming your record has an 'id' field
  router.push(`/incomerecord/${recordId}`);};
const onRowClickedExpenditure = (event) => {
  const recordId = event.data._id; // Assuming your record has an 'id' field
  router.push(`/expenditurerecord/${recordId}`);};
</script>

<script>
export default {
    name: 'App',
    components: {
        FullCalendar,
    },
  

    data() {
        return {
            calendarOptions: {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                dateClick: this.handleDateClick,
                events: [
                    { title: 'event 1', date: '2019-04-01' },
                    { title: 'event 2', date: '2019-04-02' }
                ],
                height: '500px',

            },
            
        }
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

</style>