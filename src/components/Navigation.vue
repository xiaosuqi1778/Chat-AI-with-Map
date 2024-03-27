<script setup>
import { ref, reactive, defineExpose } from 'vue';
import { layer } from '@layui/layui-vue';

import { chatData } from '../store/ChatStore';

import { favoratePoiList } from "../store/MapStore";
// import { searchPoiById } from "../services/MapServices";

import { map } from '../services/MapServices';

import { makeStartMarker, makeEndMarker } from '../services/MapServices';
import { formulateCount, startMarkerPosition, endMarkerPosition } from "../services/MapServices";
// 浏览器缓存相关
function storage(type) {
    if (type === 'favoratePoiList') {
        localStorage.setItem('favoratePoiList', JSON.stringify(favoratePoiList.value));
        layer.msg('收藏地点保存成功', {
            icon: 1,
            time: 1000,
        });
    }
    if (type === 'chatHistory') {
        localStorage.setItem('chatHistory', JSON.stringify(chatData.value));
        layer.msg('聊天记录保存成功', {
            icon: 1,
            time: 1000,
        });
    }
}
function reload(type) {
    if (type === 'favoratePoiList') {
        let data = JSON.parse(localStorage.getItem('favoratePoiList'));
        if (data) {
            favoratePoiList.value = data;
            layer.msg('收藏地点恢复成功', {
                icon: 1,
                time: 1000,
            });
        } else {
            layer.msg('暂无收藏地点', {
                icon: 7,
                time: 1000,
            });
        }
    }
    if (type === 'chatHistory') {
        let data = JSON.parse(localStorage.getItem('chatHistory'));
        // 先询问是否覆盖当前聊天记录，覆盖则直接恢复，不覆盖则在chatData前面添加
        if (data) {
            layer.confirm('是否覆盖当前聊天记录？', {
                title: '提示',
                btn: [
                    {
                        text: '追加至现聊天', callback: (id) => {
                            // 在chatData前面添加
                            chatData.value = data.concat(chatData.value);
                            layer.msg('聊天记录追加成功', {
                                icon: 1,
                                time: 1000,
                            });
                            layer.close(id);
                        }
                    },
                    {
                        text: '覆盖现有聊天', callback: (id) => {
                            chatData.value = data;
                            layer.msg('聊天记录恢复成功', {
                                icon: 1,
                                time: 1000,
                            });
                            layer.close(id);
                        }
                    }
                ]
            });
        } else {
            layer.msg('暂无聊天记录', {
                icon: 7,
                time: 1000,
            });
        }
    }
}


let placeSearch = null;
function searchPoiById(id,map) {
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
</script>

<template>
    <lay-menu v-model:selected-key="selectedKey" v-model:open-keys="openKeys1" theme="light" class="navi">
        <img src="../assets/logo.png" alt="" style="height: 48px;width: 48px;border-radius: 50%;">
        <div id="team-title">Chat AI with Map</div>
        <lay-menu-item style="margin-left: 200px;">
            <lay-icon type="layui-icon-home" style="margin-right: 2px;"></lay-icon>
            首页
        </lay-menu-item>
        <lay-sub-menu>
            <template #title>
                <lay-icon type="layui-icon-star" style="margin-right: 2px;"></lay-icon>
                收藏列表
            </template>
            <lay-menu-item v-for="item in favoratePoiList" :key="item.id" @click="searchPoiById(item.id, map)">
                {{ item.name }}
            </lay-menu-item>
        </lay-sub-menu>
        <lay-sub-menu>
            <template #title>
                <lay-icon type="layui-icon-time" style="margin-right: 2px;"></lay-icon>
                备份与恢复
            </template>
            <lay-sub-menu>
                <template #title>
                    <lay-icon type="layui-icon-chat" style="margin-right: 2px;"></lay-icon>
                    聊天记录
                </template>
                <lay-menu-item @click="storage('chatHistory')">保存聊天记录</lay-menu-item>
                <lay-menu-item @click="reload('chatHistory')">恢复聊天记录</lay-menu-item>
            </lay-sub-menu>
            <lay-sub-menu>
                <template #title>
                    <lay-icon type="layui-icon-star-fill" style="margin-right: 2px;"></lay-icon>
                    地点收藏
                </template>
                <lay-menu-item @click="storage('favoratePoiList')">保存收藏地点</lay-menu-item>
                <lay-menu-item @click="reload('favoratePoiList')">恢复收藏地点</lay-menu-item>
            </lay-sub-menu>
        </lay-sub-menu>
        <lay-sub-menu style="float: right;">
            <template #title>
                <lay-icon type="layui-icon-username" style="margin-right: 2px;"></lay-icon>
                个人中心
            </template>
            <lay-menu-item>账户</lay-menu-item>
            <lay-menu-item>
                <lay-icon type="layui-icon-help-circle" style="margin-right: 2px;"></lay-icon>
                帮助
            </lay-menu-item>
            <lay-menu-item>
                <lay-icon type="layui-icon-logout" style="margin-right: 2px;"></lay-icon>
                退出登录
            </lay-menu-item>
        </lay-sub-menu>
    </lay-menu>
</template>

<style>
.navi {
    background-color: #ADD8E6;
    color: aliceblue;
    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.25);
    /*     display:flex;
    justify-content:center; */
}

#team-title {
    display: inline-block;
    /* line-height: 30px; */
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    width: 200px;
    margin-left: 10px;
    margin-right: 10px;

    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    line-height: 100px;
}
</style>