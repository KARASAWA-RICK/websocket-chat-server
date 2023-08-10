//初始化服务器 + 注册服务



//全局数据存储
const Global = require('./Global')
//配置服务器 + 预配置session
const netbus = require("./netbus.js")
//服务管理
const serviceMgr = require("./serviceMgr.js")
//聊天室服务
const chatroomService = require("./chatroomService")





//初始化服务器
netbus.initServer("10.0.12.138", 6085)
//注册聊天室服务
serviceMgr.registService(Global.STYPE.Chatroom, chatroomService)

