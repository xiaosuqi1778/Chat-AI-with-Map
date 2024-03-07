import './assets/main.css'

// createRouter，createStore
// 保证每个实例的独立封闭性
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios';
import Layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'
 
const app = createApp(App);
app.use(Layui);
app.config.globalProperties.$axios = axios;

app.mount('#app');
// createApp(App).mount('#app')
