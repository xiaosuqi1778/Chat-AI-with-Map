import { ref } from 'vue';

export const searchDefaultType = '餐饮服务|风景名胜|购物服务|交通设施服务|生活服务|体育休闲服务|医疗保健服务';

export const startIconOptions = {
    size: [25, 34],
    image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
    imageSize: [135, 40],
    imageOffset: [-9, -3]
};
export const endIconOptions = {
    size: [25, 34],
    image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
    imageSize: [135, 40],
    imageOffset: [-95, -3]
};

export const favoratePoiList = ref([
    {
        id: "B001B0A0CK",
        name: "东湖生态旅游风景区",
        type: "风景名胜;风景名胜;国家级景点",
        lat: 30.549509,
        lng: 114.41397
    }
]);