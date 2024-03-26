import { ref } from 'vue';
import { formatAMPM } from '../services/ChatService';

export const chatData = ref([
    // 示例消息
    { message: 'Hi! How are you?', type: 'chatbot', timestamp: formatAMPM(new Date()) },
    { message: 'Hello, I\'m fine, thanks.', type: 'person', timestamp: formatAMPM(new Date()) },
    { message: 'How can I help you?', type: 'chatbot', timestamp: formatAMPM(new Date()) },
]);
export const currentChatbotReply = ref('');
export const historyChatbotReply = ref([]);

