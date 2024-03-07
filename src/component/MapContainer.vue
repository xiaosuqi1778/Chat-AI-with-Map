<script setup>
import { ref, watch, onBeforeMount, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";// 引入 JS API Loader 
import { Chat } from "@chat-ui/vue3";
import { layer } from "@layui/layui-vue";
import axios from 'axios';

const robotUrl = 'https://apis.tianapi.com/robot/index';
const robotKey = '6f29320f26e1eddff037652dbf4d3af1'
const amapKey = '638964ba011ff16f788694feb76aaa9f'
const amapSecurityCode = '0159cea799e75333853ad41b431413e5'

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

const instance = getCurrentInstance();
const data = ref([
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
    return strTime;
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
    data.value.push(createMessage('person', input));


    setTimeout(async () => {
        const response = await fetchChatbotResponse(input);
        let message;
        if (!response || response.data.code != 200) {
            message = response ? `Error code,${response.data.code}` : 'An error occurred while fetching data.';
            return;
        } else {
            message = response.data.result.reply;
        }
        console.log(`chatbotMessage: ${message}`);
        message = formatMessage(message)
        const messageChatbot = createMessage('chatbot', message);
        data.value.push(messageChatbot);
        currentChatbotReply.value = message;
        historyChatbotReply.value.push(message);
    }, getRandomNumber());
}

// 地图部分
/**
 * 先思考需要哪些功能：
 * 1.小控件：比例尺、工具条
 * 2.地图定位
 * 3.POI搜索，输入提示（后面可以删除）。这个得限制在武汉市内，但是不生效？？
 * 4.点击POI给它加个marker展示详细信息
 * 
 * 5.导航功能？？
 * 6.地图样式？？
 */

let map = null;
const searchKeyword = ref('');
const amapPlugin = ref(['AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.AutoComplete', 'AMap.Geolocation']);
//输入提示
const autoSearchOptions = {
    input: 'tipinput',
    city: '武汉',
    citylimit: true,
    datatype: 'poi', //返回的数据类型
};
const placeSearchOptions = {
    city: '武汉',
    citylimit: true,  //是否强制限制在设置的城市内搜索
    map: map,
    pageSize: 5, // 单页显示结果条数
    pageIndex: 1, // 页码
    map: map, // 展现结果的地图实例
    panel: 'panel', // 结果列表将在此容器中进行展示。
    autoFitView: true,// 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
}
let currentLocation = ref({});


onMounted(() => {
    instance.refs.chatComponent.chatOpen = true;
    layer.notify({
        title: "欢迎使用 Chat AI with Map",
        content: "Just enjoy it!",//欢迎内容
        offset: 'rt',
        time: 3000,
    })

    window._AMapSecurityConfig = {
        securityJsCode: amapSecurityCode,
    }
    AMapLoader.load({
        key: amapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: amapPlugin.value,
        // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
        .then((AMap) => {
            map = new AMap.Map("container", {
                // 设置地图的显示样式：https://lbs.amap.com/api/javascript-api-v2/guide/map/map-style
                mapStyle: 'amap://styles/fresh',
                viewMode: "2D", // 是否为3D地图模式
                zoom: 12, // 初始化地图级别
                center: [114.31, 30.52], // 初始化地图中心点位置：武汉市
            });

            // 异步加载插件
            AMap.plugin(amapPlugin.value, () => {
                // 基本控件
                let toolbar = new AMap.ToolBar({
                    offset: [8, 8],
                    position: 'RT'
                });
                map.addControl(toolbar);
                let scale = new AMap.Scale();
                map.addControl(scale);

                // 地图定位
                let geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,     //超过10秒后停止定位，默认：5s
                    position: 'RB',    //定位按钮的停靠位置
                    offset: [8, 16], //定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                });
                map.addControl(geolocation);
                geolocation.getCurrentPosition(function (status, result) {
                    if (status == 'complete') {
                        onComplete(result);
                        currentLocation.value = result.position;
                    } else {
                        onError(result)
                    }
                });

                // 自动查询
                let placeSearch = new AMap.PlaceSearch(placeSearchOptions);  //构造地点查询类
                // js api 2.0 部分方法废弃 参见：https://lbs.amap.com/api/javascript-api-v2/update
                let autoSearch = new AMap.AutoComplete(autoSearchOptions);
                autoSearch.on('select', (e) => {
                    placeSearch.search(e.poi.name, (res) => {
                        console.log('auto search keyword', res);
                    });  //关键字查询查询
                });//注册监听，当选中某条记录时会触发
            });
            /**
             * 想获取高德自有poi信息
             * 待解决
             * 未提供接口方法，只能通过搜索获取
             */
            map.on("click", function (ev) {
                //触发事件的对象
                let target = ev.target;
                //触发事件的地理坐标，AMap.LngLat 类型
                let lnglat = ev.lnglat;
                //触发事件的像素坐标，AMap.Pixel 类型
                let pixel = ev.pixel;
                //触发事件类型
                let type = ev.type;
                console.log('click', target);
            });
        })
        .catch((e) => {
            console.log('amap load error', e);
        });

});

onUnmounted(() => {
    //解绑地图的点击事件
    //销毁地图，并清空地图容器
    map?.destroy();
    /* //地图对象赋值为null
    map = null
    //清除地图容器的 DOM 元素
    document.getElementById("container").remove(); //"container" 为指定 DOM 元素的id */
});

// 解析定位结果
function onComplete(data) {
    console.log('定位成功');
    let str = [];
    str.push(`定位结果：${data.position}`);
    str.push(`定位类别：${data.location_type}`);
    if (data.accuracy) {
        str.push(`精度：${data.accuracy}米`);
    } // 如为IP精确定位结果则没有精度信息
    str.push(`是否经过偏移： ${data.isConverted ? '是' : '否'}`);
    console.log(str.join('\n'));
    layer.msg('定位成功', {
        icon: 1,
        time: 1000
    })
}
// 解析定位错误信息
function onError(data) {
    console.log('定位失败');
    console.log(`失败原因排查信息: ${data.message} 浏览器返回信息: ${data.originMessage}`);
    layer.msg('定位失败', {
        icon: 2,
        time: 1000,
    })
}

// 聊天与地图搜索交互测试
/**
 * 匹配机器人回复的关键字，然后在地图上搜索
 * 也就是检测 currentChatbotReply.value 中的关键字，然后在地图上搜索
 */
watch(
    () => currentChatbotReply.value,
    (newValue, oldValue) => {
        console.log(`currentChatbotReply: ${newValue}`);
        if (newValue.includes('正在为您搜索：')) {
            searchKeyword.value = newValue.replace('正在为您搜索：', '');
        } else {
            return;
        }
        searchPOI(true);
        /* let placeSearch = new AMap.PlaceSearch(placeSearchOptions);  //构造地点查询类
        placeSearch.search(searchKeyword.value, function (status, result) {
            // 搜索成功时，result即是对应的匹配数据
            console.log(result);
            data.value.push(createMessage('chatbot', `已为您找到共${result.poiList.count}个相关地点`));
        }) */
    }
);
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
function searchPOI(op) {
    if (searchKeyword.value == '') {
        layer.msg('请输入搜索关键字', {
            icon: 7,
            time: 1500,
            shade: true,
            shadeOpacity: 0.25
        })
        return;
    }
    AMap.plugin(['AMap.PlaceSearch'], () => {
        let placeSearch = new AMap.PlaceSearch({
            city: '武汉',
            citylimit: true,  //是否强制限制在设置的城市内搜索
            map: map,
            pageSize: 5, // 单页显示结果条数
            pageIndex: 1, // 页码
            map: map, // 展现结果的地图实例
            panel: 'panel', // 结果列表将在此容器中进行展示。
            autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
        });  //构造地点查询类
        placeSearch.search(searchKeyword.value, function (status, result) {
            // 搜索成功时，result即是对应的匹配数据
            console.log(result);
            if (op) {
                data.value.push(createMessage('chatbot', `已为您找到共${result.poiList.count}个相关地点`));
            }
            // 可以按id查询poi详情
            /* placeSearch.getDetails(result.poiList.pois[0].id, (status, res) => {
                console.log(res);
            }); */
        })
        placeSearch.on('markerClick', function (e) {
            // 根据点击marker进行下一步
            console.log(e);
            getPoiByMarker(e);
        });
        placeSearch.on('listElementClick', function (e) {
            // 根据点击列表进行下一步
            console.log(e);
            getPoiByList(e);
            // 效果一样
            /* placeSearch.getDetails(e.data.id, (status, res) => {
                console.log('get details', res);
            }); */
        });
    });

}

function getPoiByMarker(e) {
    let msg = `您在地图上点击了${e.data.name}，该地点位于${e.data.cityname}${e.data.adname}${e.data.address}`;
    data.value.push(createMessage('chatbot', msg));

}
function getPoiByList(e) {
    let msg = `您在搜索结果中点击了${e.data.name}，该地点位于${e.data.cityname}${e.data.adname}${e.data.address}`;
    data.value.push(createMessage('chatbot', msg));
}
</script>



<!-- 创建地图容器 -->

<template>
    <div id="container" ref="container"></div>
    <div class="border"></div>
    <!-- <div class="spacer"></div> -->
    <lay-panel shadow="hover" id="myPageTop" class="panel-container" style="padding: 0;">
        <div class="searchcontainer">
            <span id="searchIcon"></span>
            <input id="tipinput" v-model="searchKeyword" type="text" placeholder="搜索地点" class="search"
                @keyup.enter="searchPOI(false)">
            <!-- <button class="btnsearch" @click="searchPOI()">搜索</button> -->
            <lay-ripple>
                <lay-button class="btnsearch" @click="searchPOI(false)">搜索</lay-button>
            </lay-ripple>
        </div>
        <div id="panel"></div>
    </lay-panel>
    <div>

    </div>



    <Chat ref="chatComponent" :onSend="handleSendEvent" :chat="data" inputPlaceholder="请输入消息" bgColorHeader="#20B2AA"
        bgColorIcon="#4682B4" bgColorMessagePerson="#16b777" textColorHeader="#F6F6F6" colorOnline="#F0FFFF" />
</template>



<!-- 设置地图容器样式 -->

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
    top: 0;
    left: 0;
    width: 71%;
    height: 100%;
    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.25);
}

.border {
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0;
    box-shadow: inset 0px 0px 24px 0px #D3D3D3;
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
}

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
    top: 5px;
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
</style>
