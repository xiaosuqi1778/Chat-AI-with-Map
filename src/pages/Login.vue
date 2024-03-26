<script setup>
import { ref,reactive } from 'vue';
import { useRouter } from 'vue-router';

import { layer } from '@layui/layui-vue';

const router = useRouter();
// const toast = useToast();

const username = ref('');
const password = ref('');
const loginData = ref([]);

const model = reactive({
  username: '',
  password: ''
});

const loginBtn = async () => {
    router.push({ name: 'Home' });
    /* if (localStorage.getItem('userinfo') === null) {
        layer.msg({
            content: '请先注册!',
            time: 2
        });
    } else {
        loginData.value = JSON.parse(localStorage.getItem('userinfo'));
        if (loginData.value) {
            loginData.value.forEach((item) => {
                if (username.value === item.name && password.value === item.password) {
                    layer.msg({
                        content: '登录成功!',
                        time: 2
                    });
                    router.push({ name: 'Home' });
                }
                if (username.value === item.name && password.value !== item.password) {
                    layer.msg({
                        content: '密码错误!',
                        time: 2
                    });
                }
                if (username.value !== item.name && password.value === item.password) {
                    layer.msg({
                        content: '用户名错误!',
                        time: 2
                    });
                }
            });
        }
    } */

};

const toregister = () => {
    router.push({ name: 'Register' });
};

const topassword = () => {
    layer.msg({
        content: '请联系管理员!',
        time: 2
    });
};
</script>

<template>
    <div class="content2">
        <div class="content-box">
            <div class="content-login">
                <div class="content-login-info">
                    <div class="content-title">欢迎登录 ChatAI with Map</div>
                    <lay-form :model="model" ref="loginForm" class="layui-form" >
                        <lay-form-item label="用户名"  label-width="60" prop="username" >
                            <lay-input v-model="model.username" placeholder="请输入用户名"></lay-input>
                        </lay-form-item>
                        <lay-form-item label="密码" label-width="60" prop="password">
                            <lay-input v-model="model.password" type="password" placeholder="请输入密码"></lay-input>
                        </lay-form-item>
                        <lay-form-item style="margin: 26px;">
                            <lay-button type="default"  @click="loginBtn()" style="width:120px;background-color: aliceblue;">游客访问</lay-button>
                            <lay-button type="primary"  
                                @keyup.enter.native="loginBtn" @click="loginBtn()" style="width: 120px;float: right;">登录</lay-button>    
                        </lay-form-item>
                        <div class="content-bottom">
                            <div @click="topassword()">忘记密码？</div>
                            <div @click="toregister()">注册</div>
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
    background: rgba(223, 219, 219, 0.5);
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