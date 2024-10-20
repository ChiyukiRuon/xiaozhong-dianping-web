import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: HomeView,
            children: [
                {
                    path: 'home',
                    name: 'home',
                    component: () => import('../views/Index.vue')
                },
                {
                    path: 'search',
                    name: 'search',
                    component: () => import('../views/Search.vue')
                },
            ]
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/Dashboard.vue'),
            children: []
        },
        {
            path: '/apply',
            name: 'apply',
            component: () => import('../views/Apply.vue')
        },
    ]
})

export default router
