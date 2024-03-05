<script setup>
import { ref, onMounted, watch } from 'vue';
import { aiAxios } from '../services/request';
import moment from 'moment';
import aiHeadImg from '../assets/bot.png';
import clientHeadImg from '../assets/human.png';

const msgs = ref(localStorage.msgs_ai ? JSON.parse(localStorage.msgs_ai) : []);
const inputContent = ref('');
const oContent = ref(null);

watch(msgs, (newVal) => {
    localStorage.msgs_ai = JSON.stringify(newVal);
});

onMounted(() => {
    oContent.value = document.getElementById('chattingContent');
    setTimeout(() => {
        oContent.value.scrollTop = oContent.value.scrollHeight;
    }, 0);
});

const send = () => {
    if (inputContent.value === '') {
        return;
    }

    msgs.value.push({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        from: '匿名', // Replace with user info if available
        content: inputContent.value,
        self: true,
        avatarUrl: clientHeadImg
    });

    setTimeout(() => {
        oContent.value.scrollTop = oContent.value.scrollHeight;
    }, 0);

    getClientRobotReply();
    inputContent.value = '';
};

const getClientRobotReply = () => {
    aiAxios.post('/openapi/api/v2', {
        reqType: '0',
        perception: {
            inputText: {
                text: inputContent.value
            }
        },
        userInfo: {
            apiKey: '****', // Replace with your API key
            userId: '123456' // Replace with user ID
        }
    }).then((res) => {
        const text = res.data.results[0].values.text;
        msgs.value.push({
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            from: '智能机器人',
            content: text,
            self: false,
            avatarUrl: aiHeadImg
        });
        oContent.value.scrollTop = oContent.value.scrollHeight;
    }).catch((err) => {
        console.error(err);
    });
};

</script>

<template>
    <transition name="slide-right">
        <div class="chatting">

            <!-- 聊天界面头部 -->
            <div class="chatting-header">
                <!-- 机器人头像 -->
                <div class="chatting-back">
                    <i class="icon-back"></i>
                </div>
                <div class="chatting-title">
                    <h2>AI 智能机器人</h2>
                </div>
                <!-- 预留：菜单选项 -->
                <div class="chatting-menu">
                    <i class="icon-menu"></i>
                </div>
            </div>

            <!-- 聊天内容区域 -->
            <div ref="chattingContent" id="chattingContent" class="chatting-content">
                <div v-for="item of msgs">
                    <!--用户输入内容-->
                    <div v-if="item.self" class="chatting-item self clearfix">
                        <div class="msg-date">
                            {{ item.date }}
                        </div>
                        <div class="msg-from">
                            <span class="msg-author">{{ item.from }}</span>
                            <img :src="item.avatarUrl" alt="">
                        </div>
                        <div class="msg-content">{{ item.content }}</div>
                    </div>
                    <!--AI回复内容-->
                    <div v-else class="chatting-item other clearfix">
                        <div class="msg-date">
                            {{ item.date }}
                        </div>
                        <div class="msg-from">
                            <img :src="item.avatarUrl" alt="">
                            <span class="msg-author">{{ item.from }}</span>
                        </div>
                        <div class="msg-content">{{ item.content }}</div>
                    </div>
                </div>
            </div>

            <!-- 输入区域 -->
            <div class="chatting-input">
                <input @keyup.enter="send" v-model.trim="inputContent" placeholder="与智能机器人聊些啥">
                <button @click="send">发送</button>
            </div>

        </div>
    </transition>
</template>

<style scoped>

.chatting {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    flex: 1; /* Add this line */
}

.chatting .chatting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    width: 100%;
    background-color: #2196f3;
    color: white;
    padding-left: 10px;
    padding-right: 15px;
}

.chatting .chatting-header .chatting-back {
    width: 30px;
    height: 30px;
}

.chatting .chatting-header .chatting-back i.icon-back {
    background-size: contain;
}

.chatting .chatting-header .chatting-title i.icon-group {
    vertical-align: top;
    width: 30px;
    height: 30px;
    background-size: contain;
    margin-right: 3px;
}

.chatting .chatting-header .chatting-menu {
    width: 30px;
    height: 30px;
}

.chatting .chatting-header .chatting-menu i.icon-menu {
    background-size: contain;
}

.chatting .chatting-content {
    flex: 1;
    width: 100%;
    height: calc(100% - 100px);
    background-color: rgba(0, 0, 0, 0.1);
    overflow: auto;
}

.chatting .chatting-content .chatting-item {
    padding: 10px;
    width: 100%;
}

.chatting .chatting-content .chatting-item .msg-date {
    text-align: center;
    color: gray;
    font-size: 80%;
}

.chatting .chatting-content .chatting-item .msg-from {
    display: flex;
    align-items: center;
}

.chatting .chatting-content .chatting-item .msg-from span.loc {
    color: gray;
    font-size: 60%;
    margin-right: 5px;
}

.chatting .chatting-content .chatting-item .msg-from .msg-author {
    font-size: 1.2rem;
}

.chatting .chatting-content .chatting-item .msg-from img {
    width: 30px;
    height: 30px;
    border-radius: 15px;
}

.chatting .chatting-content .chatting-item .msg-content {
    margin-top: 5px;
    background-color: white;
    width: 200px;
    padding: 6px 10px;
    border-radius: 10px;
}

.chatting .chatting-content .chatting-item+.chatting-item {
    margin-top: 10px;
}

.chatting .chatting-content .self .msg-from {
    justify-content: flex-end;

    img {
        margin-left: 10px;
    }
}

.chatting .chatting-content .self .msg-content {
    float: right;
    word-wrap: break-word;
    word-break: break-all;
    margin-right: 10px;
}

.chatting .chatting-content .other .msg-from {
    justify-content: flex-start;

    img {
        margin-right: 10px;
    }
}

.chatting .chatting-content .other .msg-content {
    float: left;
    margin-left: 10px;
    word-wrap: break-word;
    word-break: break-all;
}

.chatting .chatting-content .online {
    width: 200px;
    margin: 3px auto;
    border-radius: 4px;
    text-align: center;
    background-color: #FFFDE7;
}

.chatting .chatting-input {
    display: flex;
    height: 40px;
    width: 100%;
}

.chatting .chatting-input input {
    flex: 1;
    padding-left: 10px;
    height: 100%;
    font-size: 1.3rem;
}

.chatting .chatting-input button {
    width: 60px;
    height: 100%;
    background-color: #2196f3;
    color: white;
    font-size: 1.2rem;
}
</style>