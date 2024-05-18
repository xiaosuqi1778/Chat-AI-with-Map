import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Home from '../pages/Home.vue';
import PersonalCenter from '../pages/PersonalCenter.vue';

// 定义路由
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/home',
        name: 'Home',
        component: Home
    },
    {
        path: '/person',
        name: 'Person',
        component: PersonalCenter
    },
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;