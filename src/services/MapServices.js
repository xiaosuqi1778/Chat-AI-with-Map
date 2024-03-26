import { createStore } from "vuex";
import { ref } from "vue";
import { layer } from "@layui/layui-vue";
import AMapLoader from "@amap/amap-jsapi-loader";// 引入 JS API Loader

import { createMessage } from "./ChatService";
import { chatData } from "../store/ChatStore";
import { startIconOptions, endIconOptions } from "../store/MapStore";

import { favoratePoiList } from "../store/MapStore";



// 解析定位结果
export function onComplete(data) {
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
export function onError(data) {
    console.log('定位失败');
    console.log(`失败原因排查信息: ${data.message} 浏览器返回信息: ${data.originMessage}`);
    layer.msg('定位失败', {
        icon: 2,
        time: 1000,
    })
}

let startMarker = null, endMarker = null;
const startMarkerPosition = ref({}), endMarkerPosition = ref({});
const formulateCount = ref([false, false]);

/* export function makeStartMarker(lng, lat) {
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
export function makeEndMarker(lng, lat) {
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
function listElementClick(e) {
    layer.confirm(`将${e.data.name}设置为？`,
        {
            title: '提示',
            btn: [
                {
                    text: '出行终点', callback: (id) => {
                        makeEndMarker(e.data.location.lng, e.data.location.lat);
                        if (!formulateCount.value[0]) {
                            layer.msg('请先设置出行起点', {
                                icon: 7,
                                time: 1500,
                                shade: true,
                                shadeOpacity: 0.25
                            })
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

// 按ID查询POI
let placeSearch = null;
export function searchPoiById(id,map) {
    if (placeSearch) {
        placeSearch.clear();
    }
    placeSearch = new AMap.PlaceSearch({
        city: '武汉',
        citylimit: true,  //是否强制限制在设置的城市内搜索
        // type: searchType, // 兴趣点类别
        pageSize: 5, // 单页显示结果条数
        pageIndex: 1, // 页码
        // map: map, // 展现结果的地图实例
        panel: 'panel', // 结果列表将在此容器中进行展示。
        autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
    });
    console.log("id", id);
    placeSearch.getDetails(id, (status, res) => {
        console.log('get details', res);
        // 在 favorateList 匹配 id 找
        map.setZoomAndCenter(15, [res.poiList.pois[0].location.lng, res.poiList.pois[0].location.lat]);
        layer.confirm(`将${res.poiList.pois[0].name}设置为出行终点？`,
            {
                title: '提示',
                btn: [
                    {
                        text: '确定', callback: (id) => {
                            makeEndMarker(res.poiList.pois[0].location.lng, res.poiList.pois[0].location.lat);
                            if (!formulateCount.value[0]) {
                                layer.msg('请先设置出行起点', {
                                    icon: 7,
                                    time: 1500,
                                    shade: true,
                                    shadeOpacity: 0.25
                                })
                            }
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
    });
}
export function addToFavorateList(poi) {
    //检查id是否重复
    let isExist = favoratePoiList.value.some((item) => {
        return item.id === poi.id;
    });
    if (isExist) {
        layer.msg('该地点已收藏', {
            icon: 7,
            time: 1500,
            shade: true,
            shadeOpacity: 0.25
        })
        return;
    }
    // 如果长度大于5个，删除第一个再添加
    if (favoratePoiList.value.length >= 5) {
        favoratePoiList.value.shift();
    }
    favoratePoiList.value.push({
        id: poi.id,
        name: poi.name,
        type: poi.type,
        lat: poi.location.lat,
        lng: poi.location.lng
    });
    layer.msg('收藏成功', {
        icon: 1,
        time: 1000,
    })
}

export function getPoiByMarker(e) {
    let msg = `您在地图上点击了${e.data.name}，该地点位于${e.data.cityname}${e.data.adname}${e.data.address}`;
    chatData.value.push(createMessage('chatbot', msg));

}
export function getPoiByList(e) {
    let msg = `您在搜索结果中点击了${e.data.name}，该地点位于${e.data.cityname}${e.data.adname}${e.data.address}`;
    chatData.value.push(createMessage('chatbot', msg));
}