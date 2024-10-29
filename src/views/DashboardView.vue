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
                    <i class='bx bx-menu' ></i>
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
                    <ion-icon name="menu-outline"></ion-icon>
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

            <!-- ================ Order Details List ================= -->
            <div class="details">
                <ag-charts :options="options"> </ag-charts>

            </div>
            <h2>Transactions</h2>
            <div class="details">

                <DataTable :data="data" class="display">
                    <thead>
                        <tr>
                            <th>A</th>
                            <th>B</th>
                        </tr>
                    </thead>
                </DataTable>
            </div>
        </div>
    </div>
    <div v-if="isMember">
        <div class="main" :class="{ active: isActive }">
            <div class="topbar">
                <div class="toggle" @click="toggleMenu">
                    <ion-icon name="menu-outline"></ion-icon>
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

                <DataTable :data="data" class="display">
                    <thead>
                        <tr>
                            <th>A</th>
                            <th>B</th>
                        </tr>
                    </thead>
                </DataTable>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import '@/assets/css/style.css'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import { useRouter } from 'vue-router';  //useRoute

const router = useRouter();

DataTable.use(DataTablesCore);

const data = [
    [1, 2],
    [3, 4],
];


const menuItems = ref([
    { title: 'Student Club', icon: 'bx bx-desktop', action: () => router.push('/home')},
    { title: 'Dashboard', icon: 'bx bx-home', action: GoDashboard },
    { title: 'Members', icon: 'bx bxs-group', action: GoMember },
    { title: 'Finance', icon: 'bx bx-dollar-circle', action: GoFinance },
    { title: 'Settings', icon: 'bx bx-cog', action: GoSetting },
    { title: 'Password', icon: 'bx bx-lock-alt', action: GoPassword },
]);

const cards = ref([
    { number: '1,504', name: 'Daily Views', icon: 'eye-outline' },
    { number: '80', name: 'Members', icon: 'cart-outline' },
    { number: '284', name: 'Comments', icon: 'chatbubbles-outline' },
    { number: '$7,842', name: 'Earning', icon: 'cash-outline' },
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

const hoveredIndex = ref(null);
const isActive = ref(false);

function setHovered(index) {
    hoveredIndex.value = index;
}

function toggleMenu() {
    isActive.value = !isActive.value;
}



</script>

<script>
import { AgCharts } from 'ag-charts-vue3';




export default {
    name: 'App',
    components: {
        'ag-charts': AgCharts,
        FullCalendar // make the <FullCalendar> tag available
    },
    setup() {
        // Chart Options
        const options = ref({
            // Data: Data to be displayed in the chart
            data: [
                { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
                { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
                { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
                { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
                { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
                { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
            ],
            // Series: Defines which chart type and data to use
            series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],
        });
        return {
            options,
        };
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
            options: {
                // Data: Data to be displayed in the chart
                data: [
                    { month: "Jan", avgTemp: 2.3, iceCreamSales: 162000 },
                    { month: "Mar", avgTemp: 6.3, iceCreamSales: 302000 },
                    { month: "May", avgTemp: 16.2, iceCreamSales: 800000 },
                    { month: "Jul", avgTemp: 22.8, iceCreamSales: 1254000 },
                    { month: "Sep", avgTemp: 14.5, iceCreamSales: 950000 },
                    { month: "Nov", avgTemp: 8.9, iceCreamSales: 200000 },
                ],
                // Series: Defines which chart type and data to use
                series: [{ type: "bar", xKey: "month", yKey: "iceCreamSales" }],
            },
        }
    },
    methods: {
        handleDateClick: function (arg) {
            alert('date click! ' + arg.dateStr)
        }
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
