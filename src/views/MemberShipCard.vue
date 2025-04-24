<template>
    <Header />
    <div class="header-spacer"></div>
    
    <div class="membership-container">
        <div class="membership-card">
            <div class="card-header">
                <div class="card-icon">
                    <i class='bx bx-id-card'></i>
                </div>
                <h1 class="card-title">Membership Card</h1>
            </div>
            
            <div class="qr-container">
                <qrcode-vue :value="qrData" :size="180" level="H" class="qr-code" />
                
            </div>
            
            <div class="member-details">
                <div class="detail-row">
                    <i class='bx bx-user'></i>
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">{{ member.name }}</span>
                </div>
                
                <div class="detail-row">
                    <i class='bx bx-id-card'></i>
                    <span class="detail-label">Student ID:</span>
                    <span class="detail-value">{{ member.studentid }}</span>
                </div>
                
                <div class="detail-row">
                    <i class='bx bx-envelope'></i>
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ member.email }}</span>
                </div>
                
                <div class="detail-row">
                    <i class='bx bx-male-female'></i>
                    <span class="detail-label">Gender:</span>
                    <span class="detail-value">{{ member.gender }}</span>
                </div>
                <div class="detail-row">
        <i class='bx bx-calendar'></i>
        <span class="detail-label">Expiry Date:</span>
        <span class="detail-value">
            {{ formatDate(member.expiry_date) || 'N/A' }}
        </span>
    </div>
            </div>
            
            <div class="card-footer">
                <button class="download-btn" @click="downloadCard">
                    <i class='bx bx-download'></i> Download Card
                </button>
            </div>
        </div>
    </div>
    
    <Footer />
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { jwtDecode } from "jwt-decode";
import QrcodeVue from 'qrcode.vue';
import html2canvas from 'html2canvas';

export default {
    components: {
        QrcodeVue,
        Header,
        Footer,
    },
    setup() {
        const student = ref({});
        const member = ref({});
        const clubLogo = ref('/default-club-logo.png'); // Replace with your logo path

        const formatDate = (dateString) => {
            if (!dateString) return null;
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        };
        const getinfo = async () => {
            if (localStorage.getItem('token')) {
                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);
                student.value = decoded.user;

                member.value = {
                    name: student.value.english_name,
                    studentid: student.value.student_id,
                    email: student.value.email,
                    gender: student.value.gender,
                    expiry_date: student.value.expiry_date 
                };
            }
        };

        const qrData = computed(() => JSON.stringify(member.value));
        
        const downloadCard = async () => {
    const card = document.querySelector('.membership-card');

    card.classList.add('no-hover');

    try {
        const canvas = await html2canvas(card, {
            backgroundColor: '#ffffff', // Explicit white background
            scale: 4, // Higher scale for better quality
            logging: true, // Helpful for debugging
            useCORS: true // If you're using external images
        });

        const link = document.createElement('a');
        link.download = `membership-card-${member.value.studentid}.png`;
        link.href = canvas.toDataURL('image/png', 1.0); // Set quality to 1.0 for full opacity
        link.click();
    } catch (error) {
        console.error('Error generating card:', error);
    }
    finally {
        // Remove the class after download
        card.classList.remove('no-hover');
    }
};


        onMounted(getinfo);

        return {
            member,
            qrData,
            clubLogo,
            downloadCard,
            formatDate
        };
    }
};
</script>

<style scoped>
/* Base Styles */
.membership-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 160px);
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.membership-card {
    width: 100%;
    max-width: 380px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    transform-style: preserve-3d;
    transition: all 0.3s ease;
}

.membership-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.header-spacer {
    height: 80px;
}

/* Card Header */
.card-header {
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    color: white;
    padding: 1.5rem;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.card-title {
    margin: 0.5rem 0 0;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 1px;
    order: 2;
}

.card-icon {
    background: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    order: 1;
    margin-bottom: 0.5rem;
}

.card-icon i {
    font-size: 2rem;
    color: #4361ee;
}

/* QR Code Section */
.qr-container {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    position: relative;
}

.qr-code {
    border: 8px solid white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.qr-overlay {
    position: absolute;
    width: 180px;
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.club-logo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.club-logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

/* Member Details */
.member-details {
    padding: 0 2rem 1.5rem;
}

.detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.detail-row i {
    font-size: 1.2rem;
    color: #4361ee;
    margin-right: 1rem;
    width: 24px;
    text-align: center;
}

.detail-label {
    font-weight: 600;
    color: #555;
    margin-right: 0.5rem;
    min-width: 80px;
}

.detail-value {
    color: #333;
    font-weight: 500;
}

/* Card Footer */
.card-footer {
    background: #f9f9f9;
    padding: 1.5rem;
    text-align: center;
    border-top: 1px solid #eee;
}

.download-btn {
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
}

.download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
}

.download-btn i {
    font-size: 1.2rem;
}

/* Animations */
@keyframes cardEntrance {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Responsive Design */
@media (max-width: 480px) {
    .membership-card {
        max-width: 100%;
    }
    
    .card-header {
        padding: 1.2rem;
    }
    
    .card-title {
        font-size: 1.5rem;
    }
    
    .member-details {
        padding: 0 1.2rem 1.2rem;
    }
}
.no-hover:hover {
    transform: none; /* Disable hover transform */
    box-shadow: none; /* Disable hover shadow */
}

</style>