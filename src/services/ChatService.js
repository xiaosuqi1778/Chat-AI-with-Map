import axios from 'axios';
import { layer } from "@layui/layui-vue";

import { robotUrl, robotKey } from '../config/key';
import { chatData,currentChatbotReply,historyChatbotReply } from '../store/ChatStore';

// 对用户输入的消息进行处理
/**
 * @function handleSendEvent
 * @description 处理用户发送的消息
 * @param {string} input 用户输入的消息
 * @returns {void}
 */
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
        message = formatMessage(message)
        const messageChatbot = createMessage('chatbot', message);
        chatData.value.push(messageChatbot);
        currentChatbotReply.value = message;
        historyChatbotReply.value.push(message);
    }, getRandomNumber());
}
/**
 * @function fetchChatbotResponse
 * @description 获取聊天机器人的回复
 * @param {string} input 用户输入的消息 
 * @returns {Promise<response>} 返回聊天机器人的回复
 */
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
/**
 * @function createMessage
 * @description 创建消息对象
 * @param {string} identity 消息发送者的身份
 * @param {string} message 消息内容
 * @returns {Object} 返回消息对象，包含消息发送者的身份、消息发送时间和消息内容
 */
export function createMessage(identity, message) {
    return {
        type: identity,
        timestamp: formatAMPM(new Date()),
        message: message
    };
}
/**
 * @function formatMessage
 * @description 格式化消息内容
 * @param {string} msg 消息内容
 * @returns {string} 返回格式化后的消息内容
 * @todo 去除demo，将此方法废弃或改进
 */
function formatMessage(msg) {
    if (msg.includes('**')) {
        return msg.replace('**', '正在为您搜索：');
    } else {
        return msg;
    }
}
/**
 * @function getRandomNumber
 * @description 获取一个随机数
 * @returns {number} 返回一个随机数
 */
function getRandomNumber() {
    return Math.floor(Math.random() * (1000));
}
/**
 * @function formatAMPM
 * @description 格式化时间
 * @param {Date} date Date对象
 * @returns {string} 返回格式化后的时间字符串，格式为：MM/DD HH:MM {AM|PM}
 */
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