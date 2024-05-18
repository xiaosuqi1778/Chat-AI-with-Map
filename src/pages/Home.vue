<script setup>
import { ref, watch, onBeforeMount, onMounted, onUnmounted, computed, getCurrentInstance, nextTick } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";// 引入 JS API Loader 
import { layer } from "@layui/layui-vue";
import axios from 'axios';

import ChatContainer from "../components/ChatContainer.vue";
import MapContainer from "../components/MapContainer.vue";
import Navigation from "../components/Navigation.vue";



// chatui 部分
/**
 * 首先展示一些信息，然后用户可以输入消息
 * 然后我们将消息发送到天行机器人API，然后我们将收到的消息显示在屏幕上。
 * 接下来可以考虑新建聊天、保存聊天历史记录等功能
 * 
 * 第三版：
 * 1.设置了一些新的颜色属性
 * 
 * 第二版：
 * 1.删除了ChatUI.vue文件，放在了MapContainer.vue中。怎么简单怎么来，父子件通信啥玩意，还有孙？？
 * 2.使用getCurrentInstance()获取当前实例，然后通过refs属性访问子组件的属性和方法
 * 3.更换聊天机器人api（https://www.tianapi.com/apiview/47）
 * 4.优化代码，提高复用性
 * 5.预留聊天信息接口（currentChatbotReply,historyChatbotnide），后面看看怎么和gpt、地图联系起来
 */

// const instance = getCurrentInstance();
/* const chatData = ref([
    // 示例消息
    { message: 'Hi! How are you?', type: 'chatbot', timestamp: formatAMPM(new Date()) },
    { message: 'Hello, I\'m fine, thanks.', type: 'person', timestamp: formatAMPM(new Date()) },
    { message: 'How can I help you?', type: 'chatbot', timestamp: formatAMPM(new Date()) },
]);
const currentChatbotReply = ref('');
const historyChatbotReply = ref([]);

async function fetchChatbotResponse(input) {
    try {
        const response = await axios.get('https://apis.tianapi.com/robot/index', {
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
function createMessage(identity, message) {
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
function formatAMPM(date) {
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
// 对用户输入的消息进行处理
function handleSendEvent(input) {
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
} */

// 地图部分
/**
 * 先思考需要哪些功能：
 * 1.小控件：比例尺、工具条
 * 2.地图定位
 * 3.POI搜索，输入提示（后面可以删除）。这个得限制在武汉市内
 * 4.点击POI给它加个marker展示详细信息
 * 
 * 5.导航功能？？ -> 设置起点（待解决）-> 已解决
 * 6.地图样式？？
 * 
 * 7.右键菜单 -> 周边搜索
 * 
 * 8.设置导航功能（步行路径规划）
 * 9.收藏地点
 */

let map = null;
let contextMenu = null;
let contextMenuPositon = null;
const wuhanCenter = [114.304569, 30.593354];

const searchDefaultType = '餐饮服务|风景名胜|购物服务|交通设施服务|生活服务|体育休闲服务|医疗保健服务';
const searchKeyword = ref('');
const amapPlugin = ref(['AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.AutoComplete', 'AMap.Geolocation']);
//输入提示
let placeSearchOptions = {
    city: '武汉',
    citylimit: true,  //是否强制限制在设置的城市内搜索
    pageSize: 5, // 单页显示结果条数
    pageIndex: 1, // 页码
    map: map, // 展现结果的地图实例
    panel: 'panel', // 结果列表将在此容器中进行展示。
    autoFitView: true,// 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
}
let currentLocation = ref({});


let startMarker = null, endMarker = null;
const startMarkerPosition = ref({}), endMarkerPosition = ref({});
const formulateCount = ref([false, false]);
/* function makeStartMarker(lng, lat) {
    if (startMarker) startMarker.remove();
    startMarkerPosition.value = { lng: lng, lat: lat };
    startMarker = new AMap.Marker({
        position: [lng, lat],
        icon: new AMap.Icon(startIconOptions),
        offset: new AMap.Pixel(-13, -30)
    });
    formulateCount.value[0] = true;
    startMarker.setMap(map);
}
function makeEndMarker(lng, lat) {
    if (endMarker) endMarker.remove();
    endMarkerPosition.value = { lng: lng, lat: lat };
    endMarker = new AMap.Marker({
        position: [lng, lat],
        icon: new AMap.Icon(endIconOptions),
        offset: new AMap.Pixel(-13, -30)
    });
    formulateCount.value[1] = true;
    endMarker.setMap(map);
} */
/* let walking = null;
watch(
    () => formulateCount.value,
    (newValue, oldValue) => {
        if (formulateCount.value[0] && formulateCount.value[1]) {
            console.log("开始规划路线");
            startMarker.remove();
            endMarker.remove();
            if (walking) walking.clear();
            AMap.plugin("AMap.Walking", () => {
                walking = new AMap.Walking({
                    map: map,
                    // panel: 'panel'
                });
                let start = [startMarkerPosition.value.lng, startMarkerPosition.value.lat];
                let end = [endMarkerPosition.value.lng, endMarkerPosition.value.lat];
                walking.search(start, end, function (status, result) {
                    // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
                    if (status === 'complete') {
                        console.log(result);
                        layer.msg("路线规划成功", { time: 1000, icon: 1 });
                        
                    } else {
                        layer.msg("路线规划失败", { time: 1000, icon: 2 });
                    }
                });
            });
            formulateCount.value = [false, false];
        }
    },
    {
        deep: true
    }
) */

// 聊天与地图搜索交互测试
/**
 * 匹配机器人回复的关键字，然后在地图上搜索
 * 也就是检测 currentChatbotReply.value 中的关键字，然后在地图上搜索
 */
/* watch(
    () => currentChatbotReply.value,
    (newValue, oldValue) => {
        console.log(`currentChatbotReply: ${newValue}`);
        if (newValue.includes('正在为您搜索：')) {
            searchKeyword.value = newValue.replace('正在为您搜索：', '');
        } else {
            return;
        }
        searchPOI(true);
    }
); */
/* watch(
    () => instance.refs.chatComponent.chatOpen,
    () => {
        if (instance.refs.chatComponent.chatOpen) {
            document.getElementById('container').className = 'mapContainerChatOpen';
        } else {
            document.getElementById('container').className = 'mapContainerChatClose';
        }
    }
) */

</script>

<template>
    <Navigation/>

    <MapContainer/>

    <div id="chatContainer">
        <ChatContainer/>
    </div>
    

</template>


<style scoped>
html,
body {
    margin: 0;
    height: 100%;
    width: 100%;
    position: absolute;
}

#container {
    position: absolute;
    top: auto;
    left: 0;
    width: 70%;
    height: calc(100% - 61px);
    /* box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.25); */
}

/* .border {
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0;
    box-shadow: inset 0px 0px 24px 0px #D3D3D3;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
} */

.mapContainerChatOpen {
    width: 70%;
}

.mapContainerChatClose {
    width: 100%;
}

#tip {
    background-color: #fff;
    padding-left: 10px;
    padding-right: 10px;
    position: absolute;
    font-size: 12px;
    right: 10px;
    top: 20px;
    border-radius: 3px;
    border: 1px solid #ccc;
    line-height: 30px;
}

.panel-container>* {
    background: whitesmoke;

    /* margin-top: 20px; */
}

#myPageTop {
    position: absolute;
    /* padding-left: 10px; */
    top: auto+10px;
    left: 10px;
    width: 310px;
    /* width: 220px; */
    /*     background: #fff none repeat scroll 0 0;
    border: 2px solid #ccc;
    border-radius: 2px;
 */
    /* Set border radius to 10px */
    /* margin: 12px auto; */
    /* padding: 2px; */
    font-family: "Microsoft Yahei", "微软雅黑", "Pinghei";
    font-size: 16px;
}


#myPageTop label {
    margin: 0 20px 0 0;
    color: #666666;
    font-weight: normal;
}

/* #myPageTop input {
    width: 170px;
    height: 24px;
} */

#myPageTop .column2 {
    padding-left: 25px;
}

/* 外部盒子,控制搜索框在页面中的位置 */
#myPageTop .searchcontainer {
    height: 55px;
    display: flex;
    justify-content: center;
    /*水平方向居中*/
    align-items: center;
    /*垂直方向居中*/
    background-color: #eee;
}

/* 搜索框样式 */
#myPageTop .search {
    width: 215px;
    height: 37px;
    background-image: url('../assets/search.png');
    /* 修改图片大小 */
    background-size: 25px 25px;
    /*搜索框背景图片*/
    background-repeat: no-repeat;
    /*设置背景图片不平铺*/
    border-radius: 30px 0px 0px 30px;
    padding-left: 50px;
    margin-left: 6px;
    /* background-position: 10px 10px; */
    /*设置背景图片的位置，靠左水平居中*/
    background-position: 10px center;
    color: #494949;
    font-size: 16px;
    border: none;
    /*去除边框*/
}

/* 搜索框获得焦点时样式 */
#myPageTop .search:focus {
    /* outline: rgb(143, 180, 214) solid 1px; */
    background-color: #F0F8FF;
    /*添加外边框*/
}

/* 搜索按钮样式 */
#myPageTop .btnsearch {
    width: 80px;
    height: 37px;
    border: none;
    margin-right: 6px;
    background-color: #31BDEC;
    color: #fff;
    border-radius: 0px 20px 20px 0px;
    font-size: 20px;
    cursor: pointer;
}

/* 按钮悬浮时样式 */
#myPageTop .btnsearch:hover {
    background-color: #1E9FFF;
}

#chatContainer{
    width: 30%;
}
</style>
