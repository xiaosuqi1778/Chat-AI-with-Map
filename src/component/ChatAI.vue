<script setup>
import { ref } from 'vue';
import { Chat } from "@chat-ui/vue3";
// const chatOpen = ref(true);
const data = ref([ // 响应式变量
    // 示例消息
    { message: 'Hi! How are you?', type: 'chatbot', timestamp: formatAMPM(new Date()) },
    { message: 'Hello, i\'m fine, thanks.', type: 'person', timestamp: formatAMPM(new Date()) },
    { message: 'How can i help you?', type: 'chatbot', timestamp: formatAMPM(new Date()) },
])

function handleSendEvent(input) {
    if (input == '') return;
    const messagePerson = {
        type: 'person',
        timestamp: formatAMPM(new Date()),
        message: input // 获取输入内容
    }
    console.log("userMessage:"+input);
    data.value.push(messagePerson);

    setTimeout(async () => { // 发送GET请求，并返回一个Promise对象
        const response = await fetch('https://www.boredapi.com/api/activity')
        const res = await response.json()
        const messageChatbot = {
            type: 'chatbot',
            timestamp: formatAMPM(new Date()),
            message: res.activity // AI回复的消息
        }
        data.value.push(messageChatbot)
    }, getRandomNumber()); // 时间间隔
}

function getRandomNumber() {
    return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    // hours = hours % 12;
    // hours = hours ? hours : 24; // 24小时制
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
</script>

<template>
    <!-- 聊天界面主题已删：https://stackblitz.com/github/nvima/chat-ui/tree/main/dev/vue3-npm?file=src%2FApp.vue -->
    <!-- onSend：为您提供用户在聊天中发送的消息。当用户发送空消息时，字符串可以为空functionstring -->
    <!-- chat 是一个聊天消息数组，其键为 “message”、“type”、“timestamp”。所有 3 个键都是字符串。
        Timestamp 键是可选的。消息和类型键（“chatbot”、“customer”）是必需的。 -->
    <!-- 删除darktheme -->

    <Chat :onSend="handleSendEvent"  
    :chat="data" 
    inputPlaceholder='请输入消息'
     />
    <!-- 
    bgColorHeader：定义标题的背景颜色string
    bgColorChat：定义聊天框的背景颜色string
    bgColorIcon：定义标题中聊天框图标的背景颜色string
    bgColorInput：定义聊天框 InputBox 的背景颜色string
    bgColorMessage聊天机器人：定义来自聊天机器人的消息的背景颜色string
    bgColorMessagePerson：定义来自人员的消息的背景颜色string
    bgColorMessageTimestamp：从消息中定义时间戳的背景颜色string
    textColorMessage聊天机器人：定义来自聊天机器人的消息的文本颜色string
    textColorMessagePerson：从人物定义时间戳的文本颜色string
    textColorMessageTimestamp：定义消息中时间戳的文本颜色string
    textColorHeader：定义聊天标题的文本颜色string
    textColorInput：定义输入字段的文本颜色string
    fillColorIcon：定义页眉中图标的填充颜色string
    margin：定义聊天的边距，例如“10px”string
    boxShadow：定义聊天的框阴影string
    height：定义聊天的高度string
    width：定义聊天的宽度string
    offline：将“联机”更改为“脱机”。boolean
    colorOnline：定义“在线状态”的圆点颜色string
    colorOffline：定义离线状态的点颜色string
    headerHeight：定义聊天的标题高度string
    inputHeight：定义聊天的输入字段高度string
    inputPlaceholder：.定义自定义输入占位符string -->
</template>

<style scoped>

</style>