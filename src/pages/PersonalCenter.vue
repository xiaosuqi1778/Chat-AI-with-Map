<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { layer } from '@layui/layui-vue';

import Navigation from '../components/Navigation.vue';

</script>

<template>
    <Navigation />
    <lay-loading ></lay-loading>
</template>



<style>

</style>