import { layer } from "@layui/layui-vue";

export const layerMessageType = {
    success: 1,
    error: 2,
    question: 3,
    detail: 4,
    sad: 5,
    smile:6,
    warning: 7,
    loading:16
}

/**
 * @function showMessage
 * @description 显示消息
 * @param {Number} message 消息内容
 * @param {String} type 消息类型，对应layerMessageType
 * @param {Numer} time 消息显示时间
 * @param {Boolean} shade 是否显示遮罩
 * @param {Number} shadeOpacity 遮罩透明度
 */
export function showMessage(message='test', type = 'success', time = 1500,shade=false,shadeOpacity=0.25) {
    layer.msg(message, {
        icon: layerMessageType[type],
        time: time,
        shade: shade,
        shadeOpacity: shadeOpacity
    })
}