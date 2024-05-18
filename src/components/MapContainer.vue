<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";// 引入 JS API Loader
import { layer } from '@layui/layui-vue';

import { startIconOptions, endIconOptions, searchDefaultType } from "../store/MapStore";
import { amapKey, amapSecurityCode } from "../config/key";

import { createMessage } from "../services/ChatService";
import { chatData } from "../store/ChatStore";
import { onComplete, onError } from '../services/MapServices';
import { getPoiByMarker, getPoiByList, addToFavorateList } from '../services/MapServices';

import { currentChatbotReply, historyChatbotReply } from "../store/ChatStore";

import { map } from "../services/MapServices";
import { makeStartMarker, makeEndMarker } from '../services/MapServices';
import { formulateCount, startMarkerPosition, endMarkerPosition } from "../services/MapServices";
import { showMessage } from "../services/LayMessageServices";
// import { map } from "../store/MapStore";

// 右键菜单
let contextMenu = null;
// 右键菜单位置
let contextMenuPositon = null;
// 武汉市中心坐标
const wuhanCenter = [114.304569, 30.593354];

// 搜索关键字
const searchKeyword = ref('');
// 需要的高德地图插件
const amapPlugin = ref(['AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.AutoComplete', 'AMap.Geolocation']);
// 当前位置
let currentLocation = ref({});

onMounted(() => {
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
            map.value = new AMap.Map("container", {
                // 设置地图的显示样式：https://lbs.amap.com/api/javascript-api-v2/guide/map/map-style
                mapStyle: 'amap://styles/fresh',
                viewMode: "2D", // 是否为3D地图模式
                zoom: 12, // 初始化地图级别
                center: wuhanCenter, // 初始化地图中心点位置：武汉市
            });

            setContextMenu();// 设置右键菜单

            // 异步加载插件
            AMap.plugin(amapPlugin.value, () => {
                // 基本控件
                let toolbar = new AMap.ToolBar({
                    offset: [8, 8],
                    position: 'RT'
                });
                map.value.addControl(toolbar);
                let scale = new AMap.Scale();
                map.value.addControl(scale);

                // 地图定位
                let geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,     //超过10秒后停止定位，默认：5s
                    position: 'RB',    //定位按钮的停靠位置
                    offset: [8, 16], //定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                });
                map.value.addControl(geolocation);
                geolocation.getCurrentPosition(function (status, result) {
                    if (status === 'complete') {
                        onComplete(result);
                        currentLocation.value = result.position;
                    } else {
                        onError(result);
                    }
                });
            });
            /**
             * 扩展功能：
             * 想获取高德自有poi信息
             * 待解决
             * 官方回复：未提供接口方法，只能通过搜索获取
             * -> 考虑配合周边搜索使用
             */
            /* map.on("click", function (ev) {
                
            }); */
        })
        .catch((e) => {
            console.log('amap load error', e);
        });

});

onUnmounted(() => {
    //解绑地图的点击事件
    //销毁地图，并清空地图容器
    map.value?.destroy();
});

/**
 * @author ${xusuqi}
 * @version 1.0
 * @description 设置右键菜单，包括在周边搜索、设置路线起止点、设置地图中心回到武汉，并绑定右键点击事件
 * @param {null}
 * @return {null}
 */
function setContextMenu() {
    contextMenu = new AMap.ContextMenu();
    contextMenu.addItem("在此点周边搜索", (e) => {
        searchPoiNearBy(contextMenuPositon.lat, contextMenuPositon.lng);
    }, 0);
    contextMenu.addItem("设为出行起点", (e) => {
        makeStartMarker(contextMenuPositon.lng, contextMenuPositon.lat);
    }, 1);
    contextMenu.addItem("设为出行终点", (e) => {
        makeEndMarker(contextMenuPositon.lng, contextMenuPositon.lat);
    }, 2);
    contextMenu.addItem("回到武汉", () => {
        map.value.setZoomAndCenter(12, wuhanCenter);
    }, 3);
    //地图绑定鼠标右击事件——弹出右键菜单
    map.value.on('rightclick', (e) => {
        contextMenu.open(map.value, e.lnglat);
        contextMenuPositon = e.lnglat;
    });
}

/**
 * @description 监听聊天机器人回复，若回复内容包含“正在为您搜索：”，则自动搜索关键字
 * @param {currentChatbotReply.value} 新值
 * @todo 优化搜索逻辑，改善Bot回复内容
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
        searchPoiByKeyword(searchKeyword.value, true);
    }
);

// 地图搜索插件
let placeSearch = null;
/**
 * @function searchPoiByKeyword
 * @description 根据关键字搜索POI,在左侧搜索列表和地图上展示结果，点击列表或地图Marker进行下一步操作
 * @param searchKeyword 搜索关键词
 * @param source 调用函数的来源 true: 机器人回复触发，false: 用户搜索
 * @param searchType 搜索POI的类型，默认为searchDefaultType
 */
function searchPoiByKeyword(searchKeyword, source, searchType = searchDefaultType) {
    if (searchKeyword == '') {
        showMessage('请输入搜索关键字', 'warning', 1500, true, 0.25);
        return;
    }
    if (placeSearch) {
        placeSearch.clear();
    }
    AMap.plugin(['AMap.PlaceSearch'], () => {
        placeSearch = new AMap.PlaceSearch({
            city: '武汉',
            citylimit: true,  //是否强制限制在设置的城市内搜索
            type: searchType, // 兴趣点类别
            map: map.value,
            pageSize: 5, // 单页显示结果条数
            pageIndex: 1, // 页码
            panel: 'panel', // 结果列表将在此容器中进行展示。
            autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
        });  //构造地点查询类
        placeSearch.search(searchKeyword, function (status, result) {
            // 搜索成功时，result即是对应的匹配数据
            console.log(result);
            if (source) {
                chatData.value.push(createMessage('chatbot', `已为您找到共${result.poiList.count}个相关地点`));
            }
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
            listElementClick(e);
            // 效果一样
            /* placeSearch.getDetails(e.data.id, (status, res) => {
                console.log('get details', res);
            }); */
        });
    });
}
/**
 * @function searchPoiNearBy
 * @description 根据经纬度搜索周边POI，在左侧搜索列表和地图上展示结果，点击列表或地图Marker进行下一步操作
 * @param lat 鼠标当前纬度
 * @param lng 鼠标当前经度
 * @param type POI搜索类型
 * @param distance 搜索半径
 */
function searchPoiNearBy(lat, lng, type = searchDefaultType, distance = 1000) {
    // 判断是否在武汉市
    if (lat < 29.9784 || lat > 31.3683 || lng < 113.8284 || lng > 115.0514) {
        layer.msg('请在武汉市内进行搜索', {
            icon: 7,
            time: 1500,
            shade: true,
            shadeOpacity: 0.25
        })
        return;
    }
    if (placeSearch) {
        placeSearch.clear();
    }
    AMap.plugin(['AMap.PlaceSearch'], () => {
        placeSearch = new AMap.PlaceSearch({
            city: '武汉',
            citylimit: true,  //是否强制限制在设置的城市内搜索
            map: map.value,
            type: type,
            pageSize: 5, // 单页显示结果条数
            pageIndex: 1, // 页码
            panel: 'panel', // 结果列表将在此容器中进行展示。
            autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
        });  //构造地点查询类
        placeSearch.searchNearBy('', [lng, lat], distance, (status, result) => {
            // 搜索成功时，result即是对应的匹配数据
            console.log(result);
            chatData.value.push(createMessage('chatbot', `已为您找到共${result.poiList.count}个相关地点`));
        })
        placeSearch.on('markerClick', (e) => {
            getPoiByMarker(e);
        });
        placeSearch.on('listElementClick', (e) => {
            getPoiByList(e);
            listElementClick(e);
        });
    });
}

/**
 * @function listElementClick
 * @description 点击搜索列表元素，弹出提示框，选择设置当前POI为出行终点或收藏地点
 * @param e 鼠标点击事件
 */
function listElementClick(e) {
    layer.confirm(`将${e.data.name}设置为？`,
        {
            title: '提示',
            btn: [
                {
                    text: '出行终点', callback: (id) => {
                        makeEndMarker(e.data.location.lng, e.data.location.lat);
                        if (!formulateCount.value[0]) {
                            showMessage('请先设置出行起点', 'warning', 1500, true, 0.25);
                        }
                        layer.close(id);
                    }
                },
                {
                    text: "收藏地点",
                    callback: (id) => {
                        addToFavorateList(e.data);
                        layer.close(id);
                    }
                },
                {
                    text: '取消', callback: (id) => {
                        layer.close(id);
                    }
                }
            ]
        }
    );
}

</script>

<template>
    <div id="container" ref="container"></div>
    <lay-panel shadow="hover" id="myPageTop" class="panel-container" style="padding: 0;">
        <div class="searchcontainer">
            <span id="searchIcon"></span>
            <input id="tipinput" v-model="searchKeyword" type="text" placeholder="搜索地点" class="search"
                @keyup.enter="searchPoiByKeyword(searchKeyword, false)">
            <lay-ripple>
                <lay-button class="btnsearch" @click="searchPoiByKeyword(searchKeyword, false)">搜索</lay-button>
            </lay-ripple>
        </div>
        <div id="panel"></div>
    </lay-panel>
</template>

<style>
#container {
    position: absolute;
    top: auto;
    left: 0;
    width: 70.5%;
    height: calc(100% - 61px);
    /* box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.25); */
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
}

#myPageTop {
    position: absolute;
    top: auto;
    /* left: 10px; */
    width: 310px;
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