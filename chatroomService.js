//聊天室服务，服务号1

const log = require("./utils/log")
const Global = require('./Global')


//当前聊天室session全局存储对象
const sessionInRoom = {}


//广播
//向聊天室里的每个session发送同一条消息（排除屏蔽session）
//传入一个CTYPE，一个消息体，一个数字（屏蔽sessionKey）
function broadcast(ctype, payLoad, blockSessionKey) {
    log.info('broadcast =====> 广播')
    for (let sessionKey in sessionInRoom) {
        if (sessionInRoom[sessionKey].sessionKey == blockSessionKey) {
            continue
        }
        let session = sessionInRoom[sessionKey].session
        let utag = sessionInRoom[sessionKey].utag
        let protoType = sessionInRoom[sessionKey].protoType
        session.sendMsg(Global.STYPE.Chatroom, ctype, utag, protoType, payLoad)
    }
}


//用户进入
function onUserEnter(session, utag, protoType, payLoad) {
    log.info('onUserEnter =====> 收到命令号Enter')

    //若无消息体(用户名)，则向客户端发送：用户无效
    if (!payLoad) {
        log.warn('用户无效')
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.Enter, utag, protoType, Global.Respones.INVALID_PARAMS)
        return
    }
    //若用户已存在，则向客户端发送：已在聊天室
    else if (sessionInRoom[session.sessionKey]) {
        log.warn('已在聊天室')
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.Enter, utag, protoType, Global.Respones.IS_IN_CHATROOM)
        return
    }
    //若一切正常 
    else {
        //向客户端发送：进入成功
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.Enter, utag, protoType, Global.Respones.OK)

        //向客户端发送其他用户的名字(除自己外)
        for (let sessionKey in sessionInRoom) {
            session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.UserEnter, utag, protoType, sessionInRoom[sessionKey].uname)
        }

        //向当前聊天室所有用户（除自己外）广播：用户已进入
        broadcast(Global.CTYPE.UserEnter, payLoad, session.sessionKey)
        //保存用户信息到聊天室
        sessionInRoom[session.sessionKey] = {
            session,
            sessionKey: session.sessionKey,
            uname: payLoad,
            utag,
            protoType,
        }



        log.info(utag + '进入成功')
    }
}




//用户退出
function onUserExit(session, utag, protoType) {
    log.info('onUserExit =====> 收到命令号Exit')

    //若无用户，则向客户端发送：用户不在房间
    if (!sessionInRoom[session.sessionKey]) {
        console.warn('用户不在聊天室，退出失败')
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.Exit, utag, protoType, Global.Respones.NOT_IN_CHATROOM)
        return
    }
    //若一切正常
    else {
        //向客户端发送：退出成功
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.Exit, utag, protoType, Global.Respones.OK)
        


    }
}



//用户发言
function onUserSend(session, utag, protoType, payLoad) {
    log.info('onUserSend =====> 收到命令号SendMsg')

    //若用户不存在，则向客户端发送：你还没进房间
    if (!sessionInRoom[session.sessionKey]) {
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.SendMsg, utag, protoType, { 0: Global.Respones.NOT_IN_CHATROOM })
        return
    }
    //若一切正常
    else {
        //向客户端发送：用户名 + 用户发言
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.SendMsg, utag, protoType, {
            0: Global.Respones.OK,
            1: sessionInRoom[session.sessionKey].uname,
            2: payLoad
        })

        //向当前聊天室所有用户（除自己外）广播：用户名 + 用户发言
        broadcast(Global.CTYPE.UserMsg, {
            0: Global.Respones.OK,
            1: sessionInRoom[session.sessionKey].uname,
            2: payLoad,
        }, session.sessionKey)
    }
}



//收到心跳
function onHeartBeat(session, utag, protoType, payLoad) {
    log.info('onHeartBeat =====> 收到命令号HeartCheck')
    if (payLoad == '心跳') {
        log.info('收到心跳!!!!!!')
        //更新最新心跳
        session.lastHeartBeat = Date.now()
        session.sendMsg(Global.STYPE.Chatroom, Global.CTYPE.HeartCheck, utag, protoType, '心跳响应')
    } else {
        log.warn('消息不是心跳')
    }
}


//聊天室服务
const chatroomService = {
    //服务名
    sname: "Chatroom",
    //服务号
    stype: Global.STYPE.Chatroom,


    //命令号匹配方法
    onRecvMsg: function (session, stype, ctype, utag, protoType, payLoad, buf) {
        log.info('onRecvMsg =====> 聊天室命令号匹配')
        log.info("客户端消息：")
        log.info('消息头：' + stype + '  ' + ctype + '  ' + utag + '  ' + protoType)
        log.info('消息体：' + payLoad)
        switch (ctype) {
            case Global.CTYPE.Enter:
                onUserEnter(session, utag, protoType, payLoad)
                break

            case Global.CTYPE.Exit:
                onUserExit(session, utag, protoType)
                break

            case Global.CTYPE.SendMsg:
                onUserSend(session, utag, protoType, payLoad)
                break

            case Global.CTYPE.HeartCheck:
                onHeartBeat(session, utag, protoType, payLoad)
                break

        }
    },

    //session断连处理方法
    onDisconnect: function (session, stype) {
        log.warn("服务" + stype + '断开连接')
        //向当前聊天室所有用户（除自己外）发送：用户已退出
        broadcast(Global.CTYPE.UserExit, sessionInRoom[session.sessionKey].uname, session.sessionKey)
        //从当前聊天室用户全局存储对象中清除用户
        sessionInRoom[session.sessionKey] = null
        delete sessionInRoom[session.sessionKey]
        log.info('清理sessionInRoom成功')
    }
}


//导出
module.exports = chatroomService
