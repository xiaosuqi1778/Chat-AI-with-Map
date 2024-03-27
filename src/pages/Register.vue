<script setup>
import { ref,reactive } from 'vue';
import { useRouter } from 'vue-router';
import { layer } from "@layui/layui-vue";

const router = useRouter();
// const toast = useToast();

const username = ref('');
const password = ref('');
const ispassword = ref('');
const userinfoList = ref([]);
const loginData = ref([]);

const model = reactive({
  username: '',
  password: '',
  ispassword: ''
});

const registerBtn = async () => {
    // const valid = await this.$refs.registerForm.validate();
    // if (valid) {
        if (password.value === ispassword.value) {
            const obj = { name: username.value, password: password.value };
            userinfoList.value.push(obj);
            localStorage.setItem('userinfo', JSON.stringify(userinfoList.value));
            // toast.success('恭喜你注册成功!');
            layer.msg('恭喜你注册成功!', {
                icon: 1,
                time: 1000,
            });
            setTimeout(() => {
                router.push({ name: 'Login' });
            }, 1000);
        } else {
            // toast.fail('两次密码不一致!');
            layer.msg('两次密码不一致!', {
                icon: 2,
                time: 1000,
            });
        }
    // }
};
const toLogin = () => {
    router.push({ name: 'Login' });
};
</script>

<template>
    <div class="content-register">
        <div class="content-box">
            <div class="content-login">
                <div class="content-login-info">
                    <div class="content-title-register">欢迎注册 Chat AI with Map</div>
                    <lay-form :model="model" ref="registerForm" class="layui-form">
                        <lay-form-item label="用户名" label-width="80" prop="username">
                            <lay-input v-model="model.username" placeholder="请输入用户名"></lay-input>
                        </lay-form-item>
                        <lay-form-item label="密码" label-width="80" prop="password">
                            <lay-input v-model="model.password" type="password" placeholder="请输入密码"></lay-input>
                        </lay-form-item>
                        <lay-form-item label="确认密码" label-width="80" prop="ispassword">
                            <lay-input v-model="model.ispassword" type="password" placeholder="请再次输入密码"></lay-input>
                        </lay-form-item>
                        <lay-form-item style="margin: 26px;">
                            <lay-button type="primary" fluid @keyup.enter.native="registerBtn"
                                @click="registerBtn()">注册</lay-button>
                        </lay-form-item>
                        <div class="content-bottom">
                            <div @click="toLogin()">已有账号？登录</div>
                        </div>
                    </lay-form>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.content-register {
    width: 100%;
    height: 100vh;
    background-image: url('../documents/test2.jpg');
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
}

.content-title-register {
    text-align: center;
    margin: 9% 0 6% 0;
    font-size: 25px;
    color: #fff
}

/* .content-box{
     width: 550px;
     height: 400px;
     background: rgba(223,219,219,0.3);
     display: flex;
     justify-content: center;
     align-items: center;
 } */
.content-login {
    width: 400px;
    height: 350px;
    background: rgba(223, 219, 219, 0.6);
    display: flex;
    border-radius: 5px;
    justify-content: center;
    align-items: center;
    box-shadow: 0 25px 35px rgba(0, 0, 0, 0.8);
}

.content-login-info {
    width: 90%;
}
</style>