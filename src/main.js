import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';



import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'bootstrap'
import 'fullcalendar'

import VueDatePicker from '@vuepic/vue-datepicker';
import QRCode from 'qrcode.vue';

import '@vuepic/vue-datepicker/dist/main.css'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);


const app = createApp(App)

app.component('VueDatePicker', VueDatePicker);
app.component('qrcode-vue', QRCode); 
app.use(PrimeVue);

app.use(router)

app.mount('#app')
