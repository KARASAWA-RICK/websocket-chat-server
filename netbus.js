//配置服务器 + 预配置session

const ws = require("ws")
const log = require('./utils/log')
const serviceMgr = require('./serviceMgr')
const protoMgr = require('./protoMgr')

//session全局存储对象
const sessionList = {}
//session全局存储键
let sessionKey = 1



//初始化服务器
//传入一个string（ip），一个number（端口），一个boolean（session是否加密）
//创建WebSocket服务器 + 服务器事件绑定
function initServer(ip, port) {
    //创建WebSocket服务器（只能建立WebSocket的session）
    const server = new ws.Server({
        host: ip,
        port: port,
    })
    log.info("initServer =====> WebSocket服务器启动：", ip, port)




    //服务器事件绑定

    //session建立事件
    server.on("connection", (session) => { onSession(session) })
    //服务器error事件
    server.on("error", (err) => { log.error("WebSocket服务器出错!") })
    //服务器关闭事件
    server.on("close", (err) => { log.error("WebSocket服务器关闭!") })
}




//session建立成功的回调
//传入一个session对象，一个boolean（session是否加密）
//获取获取session客户端的ip、端口 + session初始化 + session全局存储 + session事件绑定
function onSession(session) {
    log.info("onSession =======> session连接成功：", session._socket.remoteAddress, session._socket.remotePort)
    //session初始化

    //向session对象添加属性，标记是否连接
    session.isConnected = true

    //向session对象添加方法，用于发送消息
    session.sendMsg = sendMsg




    //session全局存储

    //向sesseion对象添加属性，标记session全局存储键
    session.sessionKey = sessionKey
    //将session存入session全局存储对象
    sessionList[sessionKey] = session
    if (sessionList[sessionKey]) {
        log.info('session' + sessionKey + '入表')
    }
    //更新到下一个session全局存储键
    sessionKey++


    //session事件绑定

    //session消息接收事件
    session.on("message", (buf) => { onSessionRecvBuffer(session, buf) })
    //session error事件
    session.on("error", (err) => { session.close() })
    //session断连事件
    session.on("close", () => { onSessionClose(session) })



    //心跳检查

    //向session对象添加属性，标记心跳ID
    session.heartBeat = 0
    //向session对象添加属性，标记上次心跳时间
    session.lastHeartBeat = 0
    //向session对象添加方法，用于开始检查心跳
    session.startheartCheck = startheartCheck
    //向session对象添加方法，用于停止检查心跳
    session.stopHeartCheck = stopHeartCheck
    //开始心跳检查
    session.startheartCheck()
}

//开始心跳检查
function startheartCheck() {
    log.info('startheartCheck =====> 开始心跳检查')
    this.lastHeartBeat = Date.now()
    this.heartBeat = setInterval(() => {
        if (Date.now() - this.lastHeartBeat > 10000) {
            log.warn('session' + this.sessionKey + '断网了')
            this.close()
        }
    }, 3000)
}

//停止心跳检查
function stopHeartCheck() {
    log.info('stopHeartCheck =====> 停止心跳检查')
    clearInterval(this.heartBeat)
}

//session消息接收的回调
//传入一个session，一个Buffer对象（消息）
//完全解码消息
function onSessionRecvBuffer(session, buf) {
    log.info('onSessionRecvBuffer =====> session收到消息')
    //若消息不是Buffer，则关闭session
    if (!Buffer.isBuffer(buf)) {
        log.warn('收到消息不是Buffer')
        log.warn('session关闭')
        session.close()
    }
    //否则，匹配对应服务
    else if (!serviceMgr.serviceMatch(session, buf)) {
        log.warn('session关闭')
        session.close()
    }
}


//session断连的回调
//传入一个session
//标记session未连接 + session上所有service断连处理 + 从session全局存储对象中移除session
function onSessionClose(session) {
    log.info('onSessionClose =====> session关闭')
    //标记session未连接
    session.isConnected = false
    //关闭心跳检查
    session.stopHeartCheck()

    //调用此session上所有service的断连处理方法
    for (let stype in serviceMgr.serviceModules) {
        serviceMgr.serviceModules[stype].onDisconnect(session, stype)
    }

    //从session全局存储对象中移除session
    if (sessionList[session.sessionKey]) {
        sessionList[session.sessionKey] = null
        delete sessionList[session.sessionKey]
        session.sessionKey = null
        log.info('移除session成功')
    } else {
        log.warn('移除session失败')
    }
}

//向客户端发送消息
function sendMsg(stype, ctype, utag, protoType, payLoad) {
    log.info('sendMsg =====> 服务器发送消息')
    log.info('服务号：' + stype + '       ' + '命令号：' + ctype + 'utag：' + utag)
    if (!this.isConnected) {
        log.warn('session尚未建立，发送消息失败')
        return
    }

    //从0到1编码消息
    let buf = protoMgr.encodeBuffer(stype, ctype, utag, protoType, payLoad)
    if (buf) {
        this.send(buf)
        log.info('服务端发送消息成功')
    } else {
        log.warn('服务端发送信息失败')
    }
}




//导出
module.exports = {
    initServer
}


