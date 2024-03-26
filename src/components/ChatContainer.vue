<script setup>
import { ref, reactive,onMounted,getCurrentInstance } from 'vue';
import { Chat } from "@chat-ui/vue3";

import { chatData } from '../store/ChatStore';
import { handleSendEvent } from '../services/ChatService';

const instance = getCurrentInstance();

onMounted(() => {
    instance.refs.chatComponent.chatOpen = true;
});

</script>

<template>
    <Chat ref="chatComponent" 
    :onSend="handleSendEvent" 
    :chat="chatData" 
    inputPlaceholder="请输入消息"
    bgColorHeader="#20B2AA" 
    bgColorIcon="#4682B4" 
    bgColorMessagePerson="#16b777" 
    textColorHeader="#F6F6F6"
    colorOnline="#F0FFFF" />
</template>

<style>

</style>