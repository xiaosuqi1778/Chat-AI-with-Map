<script setup>
import { ref, watch, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";// 引入 JS API Loader 
import { Chat } from "@chat-ui/vue3";
import axios from 'axios';


// chatui 部分
/**
 * 首先展示一些信息，然后用户可以输入消息
 * 然后我们将消息发送到天行机器人API，然后我们将收到的消息显示在屏幕上。
 * 
 * 较第一版变化：
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
        const response = await axios.get("https://apis.tianapi.com/robot/index", {
            params: {
                key: "【你的key】",
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
function getRandomNumber() {
    return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
}
function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    // hours = hours % 12;
    // hours = hours ? hours : 24; // 24小时制
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function handleSendEvent(input) {
    if (input == '') {
        alert('请输入消息');
        return;
    };
    console.log("userMessage:" + input);
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
        console.log("chatbotMessage:" + message);
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
 */

let map = null;

onMounted(() => {
    instance.refs.chatComponent.chatOpen = true;
    // chatBoxOpen.value = true;

    window._AMapSecurityConfig = {
        securityJsCode: "【你的安全密钥】",
    }
    AMapLoader.load({
        key: "【你的key】", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15

        plugins: ['AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.AutoComplete', 'AMap.Geolocation'],
        // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
        .then((AMap) => {
            map = new AMap.Map("container", {
                // 设置地图容器id
                viewMode: "3D", // 是否为3D地图模式
                zoom: 11, // 初始化地图级别
                center: [114.31, 30.52], // 初始化地图中心点位置：武汉市
            });


            // 异步加载插件
            AMap.plugin(['AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.AutoComplete'], () => {
                // 基本控件
                let toolbar = new AMap.ToolBar({
                    offset: AMap.Pixel(100, 100),
                    position: 'RT'
                });
                map.addControl(toolbar);
                let scale = new AMap.Scale();
                map.addControl(scale);

                // 地图定位
                /* let geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：5s
                    position: 'RB',    //定位按钮的停靠位置
                    offset: [10, 20], //定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                });
                map.addControl(geolocation);
                geolocation.getCurrentPosition(function (status, result) {
                    if (status == 'complete') {
                        onComplete(result)
                    } else {
                        onError(result)
                    }
                }); */


                //输入提示
                let autoOptions = {
                    input: "tipinput",
                    city: '武汉',
                    citylimit: true,
                    datatype: "poi", //返回的数据类型
                };

                let placeSearch = new AMap.PlaceSearch({
                    city: '武汉',
                    citylimit: true,  //是否强制限制在设置的城市内搜索
                    map: map,
                    pageSize: 5, // 单页显示结果条数
                    pageIndex: 1, // 页码
                    map: map, // 展现结果的地图实例
                    panel: "panel", // 结果列表将在此容器中进行展示。
                    autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
                });  //构造地点查询类

                // js api 2.0 部分方法废弃 参见：https://lbs.amap.com/api/javascript-api-v2/update
                let auto = new AMap.AutoComplete(autoOptions);

                auto.on("select", (e) => {
                    placeSearch.setCity('武汉');
                    placeSearch.search(e.poi.name);  //关键字查询查询
                });//注册监听，当选中某条记录时会触发

            });
        })
        .catch((e) => {
            console.log(e);
        });
});

onUnmounted(() => {
    map?.destroy();
});

// 解析定位结果
function onComplete(data) {
    console.log('定位成功');
    let str = [];
    str.push('定位结果：' + data.position);
    str.push('定位类别：' + data.location_type);
    if (data.accuracy) {
        str.push('精度：' + data.accuracy + ' 米');
    } // 如为IP精确定位结果则没有精度信息
    str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
    console.log(str.join('\n'));
    window.alert('定位成功');
}
// 解析定位错误信息
function onError(data) {
    console.log('定位失败');
    console.log('失败原因排查信息: ' + data.message + '\n浏览器返回信息: ' + data.originMessage);
    // 弹出窗口提示用户
    window.alert('定位失败');
}

// 聊天与地图搜索交互测试
/**
 * 匹配机器人回复的关键字，然后在地图上搜索
 * 也就是检测 currentChatbotReply.value 中的关键字，然后在地图上搜索
 */
watch(
    () => currentChatbotReply.value,
    (newValue, oldValue) => {
        console.log('currentChatbotReply:', newValue);
        let autoOptions = {
            city: '武汉'
        }
        if (newValue.includes('**')) {
            newValue = newValue.replace('**', '');
        } else {
            return;
        }
        let placeSearch = new AMap.PlaceSearch({
            city: '武汉',
            citylimit: true,  //是否强制限制在设置的城市内搜索
            map: map,
            pageSize: 5, // 单页显示结果条数
            pageIndex: 1, // 页码
            map: map, // 展现结果的地图实例
            panel: "panel", // 结果列表将在此容器中进行展示。
            autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
        });  //构造地点查询类
        placeSearch.search(newValue, function (status, result) {
            // 搜索成功时，result即是对应的匹配数据
            console.log(result);
        })
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

</script>



<!-- 创建地图容器 -->

<template>
    <div id="container" ref="container"></div>
    <div id="myPageTop">
        <table>
            <tr>
                <td>
                    <label>请输入POI关键字：</label>
                </td>
            </tr>
            <tr>
                <td>
                    <input id="tipinput" />
                </td>
            </tr>
        </table>
        <div id="panel"></div>
        <!-- 展示定位信息 -->
        <!-- <div class="info">
            <h4 id="status"></h4>
            <hr>
            <p id="result"></p>
            <hr>
        </div> -->
    </div>
    <Chat ref="chatComponent" :onSend="handleSendEvent" :chat="data" inputPlaceholder='请输入消息' />
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
    width: 70.5%;
    height: 100%;
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

#myPageTop {
    position: absolute;
    /* padding-left: 10px; */
    top: 5px;
    left: 10px;
    /* width: 220px; */
    background: #fff none repeat scroll 0 0;
    border: 2px solid #ccc;
    margin: 12px auto;
    padding: 10px;
    font-family: "Microsoft Yahei", "微软雅黑", "Pinghei";
    font-size: 16px;
}

#myPageTop label {
    margin: 0 20px 0 0;
    color: #666666;
    font-weight: normal;
}

#myPageTop input {
    width: 170px;
    height: 24px;
}

#myPageTop .column2 {
    padding-left: 25px;
}
</style>
