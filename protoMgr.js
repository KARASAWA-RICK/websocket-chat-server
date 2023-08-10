//编码管理


const log = require("./utils/log.js");
const protoTools = require("./protoTools.js");




//Buffer加密
function encryptBuffer(buf) {
    return buf
}
//Buffer解密
function decryptBuffer(buf) {
    return buf
}



//从0到1编解码消息
function encodeBuffer(stype, ctype, utag, protoType, payLoad) {
    log.info('encodeBuffer =====> 从0到1编码消息')

    //原消息体 → 对象 → Json
    let payLoadObj = {}
    payLoadObj[0] = payLoad
    let payLoadJson = JSON.stringify(payLoadObj)

    //创建Buffer对象
    let byteLen = new Blob([payLoadJson]).size
    let totalLen = 12 + byteLen
    let buf = protoTools.allocBuffer(totalLen)

    //编码消息头
    protoTools.writeHeaderInBuffer(buf, stype, ctype, utag, protoType, byteLen)

    //编码消息体
    protoTools.writeStrInBuffer(buf, payLoadJson)

    //加密
    buf = encryptBuffer(buf)

    if (buf) {
        log.info('从0到1编码成功')
        return buf
    } else {
        log.warn('从0到1编码失败')
        return null
    }
}

function decodeBuffer(buf) {
    log.info('decodeBuffer =====> 从0到1解码消息')
    //解密
    decryptBuffer(buf)

    //若消息总长度小于消息头长度，则退出
    if (!buf) {
        log.warn('没有消息')
        return null
    } else if (buf.length < protoTools.headerSize) {
        log.warn('消息比消息头还小')
        return null
    }


    //解码消息头
    let headerObj = protoTools.readHeaderInBuffer(buf)
    let messageObj = {}
    for (let i = 0; i < 5; i++) {
        messageObj[i] = headerObj[i]
    }


    //解码消息体
    let payLoadJson = protoTools.readStrInBuffer(buf)
    try {
        let payLoadObj = JSON.parse(payLoadJson)
        messageObj[5] = payLoadObj[0]
    }
    catch (err) {
        log.warn('从0到1编码失败，Json解析失败')
        return null
    }

    if (!messageObj ||
        typeof (messageObj[0]) == "undefined" ||
        typeof (messageObj[1]) == "undefined" ||
        typeof (messageObj[2]) == "undefined" ||
        typeof (messageObj[3]) == "undefined" ||
        typeof (messageObj[4]) == "undefined" ||
        typeof (messageObj[5]) == "undefined") {
        log.warn('从0到1编码失败，messageObj里有undefined')
        return null
    } else {
        log.info('从0到1编码成功')
        return messageObj
    }
}




module.exports = {
    decryptBuffer,
    encryptBuffer,
    encodeBuffer,
    decodeBuffer,
}
