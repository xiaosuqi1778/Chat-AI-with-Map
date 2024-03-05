import './assets/main.css'

// createRouter，createStore
// 保证每个实例的独立封闭性
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios';
 
const app = createApp(App)
app.config.globalProperties.$axios = axios;

app.mount('#app')
createApp(App).mount('#app')
