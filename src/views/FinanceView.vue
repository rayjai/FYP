<template>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    </link>
    <div class="navigation">
        <ul>
            <li v-for="(item, index) in menuItems" :key="index" @mouseover="setHovered(index)"
                :class="{ hovered: hoveredIndex === index }">
                <a href="#">
                    <span class="icon">
                        <i :class='item.icon'></i>
                    </span>
                    <span class="title">{{ item.title }}</span>
                </a>
            </li>
        </ul>
    </div>

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

</template>

<script setup>
import { ref } from 'vue';
import '@/assets/css/style.css'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const menuItems = ref([
    { title: 'Student Club', icon: 'bx bx-desktop' },
    { title: 'Dashboard', icon: 'bx bx-home' },
    { title: 'Members', icon: 'bx bxs-group' },
    { title: 'Finance', icon: 'bx bx-dollar-circle' },
    { title: 'Settings', icon: 'bx bx-cog' },
    { title: 'Password', icon: 'bx bx-lock-alt' },
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
export default {
    components: {
        FullCalendar // make the <FullCalendar> tag available
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
                
            }
        }
    },
    methods: {
        handleDateClick: function (arg) {
            alert('date click! ' + arg.dateStr)
        }
    }
}
</script>
