//service管理


const log = require("./utils/log")
const protoMgr = require("./protoMgr")


//service全局存储对象
const serviceModules = {}

//注册service
//传入一个STYPE(服务号)，一个service对象（具体服务）
//将service存入service全局存储对象
function registService(stype, service) {
    log.info('registService =====> 注册服务：' + stype)
    if (serviceModules[stype]) {
        log.warn(serviceModules[stype].sname + '服务已被注册！')
    }
    else {
        serviceModules[stype] = service
        log.info(serviceModules[stype].sname + '服务注册成功！')
    }
}


//根据接收的消息匹配服务
//从0到1解码消息 + 执行对应服务的命令号匹配方法
//传入一个session对象，一个Buffer对象（消息）
function serviceMatch(session, buf) {
    log.info('serviceMatch =====> 匹配服务号')

    //从0到1解码消息
    let messageObj = protoMgr.decodeBuffer(buf)
    let stype, ctype, utag, protoType, byteLen, payLoad
    stype = messageObj[0]
    ctype = messageObj[1]
    utag = messageObj[2]
    protoType = messageObj[3]
    byteLen = messageObj[4]
    payLoad = messageObj[5]
    log.info('消息头：' + stype + '  ' + ctype + '  ' + utag + '  ' + protoType + '  ' + byteLen)
    log.info('消息体：' + payLoad)


    //根据消息头里的服务号检查：是否有匹配的服务
    if (!serviceModules[stype]) {
        log.warn('没有匹配的服务')
        return false
    } else {
        log.info('有匹配的服务')
        //执行对应服务的命令号匹配方法
        serviceModules[stype].onRecvMsg(session, stype, ctype, utag, protoType, payLoad, buf)
        return true
    }
}

//导出
module.exports = {
    serviceModules,
    registService,
    serviceMatch,

}
