import axios from 'axios';
import { layer } from "@layui/layui-vue";

import { robotUrl, robotKey } from '../config/key';
import { chatData,currentChatbotReply,historyChatbotReply } from '../store/ChatStore';

// 对用户输入的消息进行处理
export function handleSendEvent(input) {
    if (input.trim() === '') {
        layer.msg('请输入消息', {
            icon: 7,
            time: 1500,
            shade: true,
            shadeOpacity: 0.2
        });
        return;
    }
    console.log('userMessage', input);
    chatData.value.push(createMessage('person', input));

    setTimeout(async () => {
        const response = await fetchChatbotResponse(input);
        let message;
        if (!response || response.data.code != 200) {
            message = response ? `Error code,${response.data.code}` : 'An error occurred while fetching data.';
            return;
        } else {
            message = response.data.result.reply;
        }
        // console.log(`chatbotMessage: ${message}`);
        message = formatMessage(message)
        const messageChatbot = createMessage('chatbot', message);
        chatData.value.push(messageChatbot);
        currentChatbotReply.value = message;
        historyChatbotReply.value.push(message);
    }, getRandomNumber());
}

async function fetchChatbotResponse(input) {
    try {
        const response = await axios.get(robotUrl, {
            params: {
                key: robotKey,
                question: input,
                uniqueid: '123456',
                priv: 1
            }
        });
        return response;
    } catch (error) {
        console.log('fetch botapi error', error);
        return null;
    }
}
export function createMessage(identity, message) {
    return {
        type: identity,
        timestamp: formatAMPM(new Date()),
        message: message
    };
}
function formatMessage(msg) {
    if (msg.includes('**')) {
        return msg.replace('**', '正在为您搜索：');
    } else {
        return msg;
    }
}
function getRandomNumber() {
    return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
}
export function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let dateStr = month + '/' + day;
    return dateStr + ' ' + strTime;
}