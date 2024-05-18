<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { layer } from '@layui/layui-vue';
import { layerMessageType,showMessage } from '../services/LayMessageServices';


const router = useRouter();

const username = ref('');
const password = ref('');
const loginData = ref([]);

const model = reactive({
    username: '',
    password: ''
});
const testUser = {
    name: 'admin123',
    password: 'admin123'
};

/**
 * @function loginBtn
 * @description 登录按钮
 * @returns void
 * @todo 与后端交互，实现用户登录验证逻辑
 */
const loginBtn = async () => {
    if (localStorage.getItem('userinfo') === null) {
        showMessage('用户名不存在，请先注册！','error');
    } else {
        loginData.value = JSON.parse(localStorage.getItem('userinfo'));
        if (loginData.value) {
            loginData.value.forEach((item) => {
                if (model.username === item.name && model.password === item.password) {
                    layer.msg('登录成功!',{time: 2000});
                    router.push({ name: 'Home' });  // 将跳转操作放在这里
                    return;
                }
                if (model.username !== item.name) {
                    // layer.msg('用户名错误!', { time: 200 });
                    showMessage('用户名错误!','error');
                    return;
                }
                if (model.password !== item.password) {
                    // layer.msg('密码错误!',{time: 200});
                    showMessage('密码错误!', 'error');
                    return;
                }
            });
        } else {
            showMessage('用户名不存在，请先注册！','error');
        }
    }
};
const visitorLogin = () => {
    // layer.msg('登录成功!',{time: 2000});
    showMessage('登录成功!','success',2000);
    router.push({ name: 'Home' });
};

/**
 * @function toRegisterView
 * @description 跳转到注册页面
 */
const toRegisterView = () => {
    router.push({ name: 'Register' });
};

/**
 * @function toForgetPasswordView
 * @description 跳转到忘记密码页面
 * @todo 增加忘记密码页面
 */
const toForgetPasswordView = () => {
    /* layer.msg("请联系管理员修改密码", {
        time: 200
    }); */
    showMessage('请联系管理员修改密码','detail');
};
</script>

<template>
    <div class="content2">
        <div class="content-box">
            <div class="content-login">
                <div class="content-login-info">
                    <div class="content-title">欢迎登录 ChatAI with Map</div>
                    <lay-form :model="model" ref="loginForm" class="layui-form">
                        <lay-form-item label="用户名" label-width="60" prop="username">
                            <lay-input v-model="model.username" placeholder="请输入用户名"></lay-input>
                        </lay-form-item>
                        <lay-form-item label="密码" label-width="60" prop="password">
                            <lay-input v-model="model.password" type="password" placeholder="请输入密码"></lay-input>
                        </lay-form-item>
                        <lay-form-item style="margin: 26px;">
                            <lay-button type="default" @click="visitorLogin()"
                                style="width:120px;background-color: aliceblue;">游客访问</lay-button>
                            <lay-button type="primary" @keyup.enter.native="loginBtn" @click="loginBtn()"
                                style="width: 120px;float: right;">登录</lay-button>
                        </lay-form-item>
                        <div class="content-bottom">
                            <div @click="toForgetPasswordView()">忘记密码？</div>
                            <div @click="toRegisterView()">注册</div>
                        </div>
                    </lay-form>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
html,
body {
    margin: 0;
    height: 100%;
    width: 100%;
    position: absolute;

}

.content2 {
    width: 100%;
    height: 100vh;
    background-image: url('../assets/login.jpg');
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.content-title {
    text-align: center;
    margin-top: 10%;
    margin-bottom: 10%;
    font-size: 25px;
    font-weight: bold;
    color: #fff;
    /* 给文字加阴影 */
    text-shadow: 0 0 10px #5a5a5a;
}

.content-login {
    position: fixed;
    top: 26%;
    left: 36.5%;
    width: 400px;
    height: 300px;
    background: rgba(223, 219, 219, 0.6);
    display: flex;
    border-radius: 5px;
    justify-content: center;
    align-items: center;
    box-shadow: 0 25px 35px rgba(0, 0, 0, 0.8);
}

.content-login-info {
    width: 90%;
    height: 100%;
    /* margin-top: 10% */
}

.content-bottom {
    display: flex;
    justify-content: space-between;
    color: rgb(75, 46, 242);
    font-size: 16px;
    font-weight: bold;
    text-shadow: 0 0 10px #5a5a5a;
}

.content-bottom :hover {
    cursor: pointer;
}
</style>