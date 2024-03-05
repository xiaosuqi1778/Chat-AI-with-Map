<script setup>
import MapContainer from './component/MapContainer.vue';
/* import ChatUI from './component/ChatUI.vue';
import ChatAI from './component/ChatAI.vue';
 */</script>


<template>
  <div class="container">
    <MapContainer class="mapContainer" />
    <!-- <div class="spacer"></div> -->
    <!-- <ChatUI /> -->
    <!-- <ChatAI /> -->
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

/* 设置mapcontainer 75%，chatui 25% */
.container {
  display: flex;
  width: 100%;
  height: 100%;
}

.mapContainer {
  /* flex: 0 0 75%; */
  width: 70%;
  height: 100%;
}

.ChatUI {
  flex: 0 0 28%;
  width: 28%;
  height: 100%;
  margin-left: auto;
}
</style>
