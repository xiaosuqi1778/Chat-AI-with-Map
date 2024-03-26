import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios';
import Layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'
import router from './router/index'

const app = createApp(App);
app.use(Layui);
app.config.globalProperties.$axios = axios;
// 使用路由
app.use(router)
app.mount('#app');