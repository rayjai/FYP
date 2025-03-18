import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/createclub',
      name: 'createclub',
      component: () => import('../views/CreateClub.vue')
    },
    {
      path: '/event',
      name: 'event',
      component: () => import('../views/EventView.vue')
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/SignInView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('../views/GalleryView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        requiresAuth: true // Add meta field to indicate protected route
      }
    },
    {
      path: '/forum',
      name: 'forum',
      component: () => import('../views/ForumView.vue'),
      meta: {
        requiresAuth: true // Add meta field to indicate protected route
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        requiresAuth: true // Add meta field to indicate protected route
      }
    },
    {
      path: '/eventregister/:id',
      name: 'eventregister',
      component: () => import('../views/EventRegisterView.vue'),
      meta: {
        requiresAuth: true // Add meta field to indicate protected route
      }
    },
    {
      path: '/finance',
      name: 'finance',
      component: () => import('../views/FinanceView.vue'),
      meta: {
        requiresAuth: true // Add meta field to indicate protected route
      }
    },
    {
      path: '/eventnew',
      name: 'eventnew',
      component: () => import('../views/EventNewView.vue'),
      meta: {
        requiresAuth: true // Add meta field to indicate protected route
      }
    },
    {
      path: '/event/detail/:id',
      name: 'eventdetail',
      component: () => import('../views/EventDetailView.vue'),
    },
    {
      path: '/event/edit/:id',
      name: 'eventedit',
      component: () => import('../views/EventEditView.vue'),
    },
    {
      path: '/membershipcard',
      name: 'membershipcard',
      component: () => import('../views/MemberShipCard.vue'),
    },
    {
      path: '/qrcodescan/:id',
      name: 'qrcodescan',
      component: () => import('../views/QRcodeScan.vue'),
    },
    {
      path: '/studenteventrecord',
      name: 'studenteventrecord',
      component: () => import('../views/StudentEventRecord.vue'),
    },
    {
      path: '/forget',
      name: 'forget',
      component: () => import('../views/ForgetPassword.vue'),
    },
    {
      path: '/createpost/:id',
      name: 'createpost',
      component: () => import('../views/CreatePost.vue'),
    },
    {
      path: '/postdetail/:id',
      name: 'postdetail',
      component: () => import('../views/PostDetail.vue'),
    },
    {
      path: '/editpost/:id',
      name: 'editpost',
      component: () => import('../views/EditPost.vue'),
    },
    {
      path: '/incomerecord/:id',
      name: 'IncomeRecordDetail',
      component: () => import('../views/IncomeRecordDetail.vue'),
    },
    {
      path: '/expenditurerecord/:id',
      name: 'ExpenditureRecordDetail',
      component: () => import('../views/ExpenditureRecordDetail.vue'),
    },
    {
      path: '/memberdetail/:id',
      name: 'MemberDetail',
      component: () => import('../views/MemberDetail.vue'),
    },
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      // User is authenticated, proceed to the route
      next();
    } else {
      // User is not authenticated, redirect to login
      next('/signin');
    }
  } else {
    // Non-protected route, allow access
    next();
  }
});

export default router
