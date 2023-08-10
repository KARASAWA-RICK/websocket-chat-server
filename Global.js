//全局数据存储


//服务号
const STYPE = {
    Chatroom: 1,
}

//命令号
const CTYPE = {
    Enter: 1, // 用户进来
    Exit: 2, // 用户离开ia
    UserEnter: 3, // 别人进来;
    UserExit: 4, // 别人离开

    SendMsg: 5, // 自己发送消息,
    UserMsg: 6, // 收到别人的消息
    HeartCheck: 7
}

//消息体中转类型
const ProtoType = {
    PROTO_JSON: 1,
}

//响应类型
const Respones = {
    OK: 1,
    IS_IN_CHATROOM: -100, // 玩家已经在聊天室
    NOT_IN_CHATROOM: -101, // 玩家不在聊天室
    INVALD_OPT: -102, // 玩家非法操作
    INVALID_PARAMS: -103, // 命令格式不对
}




//导出
module.exports = {
    STYPE,
    CTYPE,
    Respones,
    ProtoType
}