//日志模块


//导入util模块
const util = require('util')


//日志级别选项
const LEVEL = {
    ALL: Infinity,
    INFO: 3,
    WARN: 2,
    ERROR: 1,
    NONE: -Infinity
}
//日志级别过滤器，默认最高级别
let globalLevel = LEVEL.ALL
//设置日志级别过滤器
function setLevel(level) {
    globalLevel = level
}

//日志颜色选项
const COLOR = {
    RESET: '\u001b[0m',
    INFO: '\u001b[32m', //绿
    WARN: '\u001b[33m', //黄
    ERROR: '\u001b[31m' //红
}
//日志是否有颜色，默认true
let coloredOutput = true
//设置日志是否有颜色
function setColoredOutput(bool) {
    coloredOutput = bool
}



//处理错误堆栈信息
function newPrepareStackTrace(error, structuredStack) {
    return structuredStack
}

//输出日志
//传入一个日志级别，一个字符串(日志内容)
function log(level, message) {

    let oldPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = newPrepareStackTrace
    let structuredStack = new Error().stack
    Error.prepareStackTrace = oldPrepareStackTrace
    let caller = structuredStack[2]

    let lineSep = process.platform == 'win32' ? '\\' : '/'
    let fileNameSplited = caller.getFileName().split(lineSep)
    let fileName = fileNameSplited[fileNameSplited.length - 1]
    let lineNumber = caller.getLineNumber()
    let columnNumber = caller.getColumnNumber()

    let levelString
    switch (level) {
        case LEVEL.INFO:
            levelString = '[INFO]'
            break
        case LEVEL.WARN:
            levelString = '[WARN]'
            break
        case LEVEL.ERROR:
            levelString = '[ERROR]'
            break
        default:
            levelString = '[]'
            break
    }
    let output = util.format('%s %s(%d,%d) %s',
        levelString, fileName, lineNumber, columnNumber, message
    )
    if (!coloredOutput) {
        process.stdout.write(output + '\n')
    } else {
        switch (level) {
            case LEVEL.INFO:
                process.stdout.write(COLOR.INFO + output + COLOR.RESET + '\n')
                break
            case LEVEL.WARN:
                process.stdout.write(COLOR.WARN + output + COLOR.RESET + '\n')
                break
            case LEVEL.ERROR:
                process.stdout.write(COLOR.ERROR + output + COLOR.RESET + '\n')
                break
            default:
                break
        }
    }
}

//两种方式输出INFO级别的日志：
//直接输出字符串
//格式化输出
function info() {
    if (LEVEL.INFO <= globalLevel) {
        log(LEVEL.INFO, util.format.apply(null, arguments))
    }
}

//两种方式输出WARN级别的日志：
//直接输出字符串
//格式化输出
function warn() {
    if (LEVEL.WARN <= globalLevel) {
        log(LEVEL.WARN, util.format.apply(null, arguments))
    }
}

//两种方式输出ERROR级别的日志：
//直接输出字符串
//格式化输出
function error() {
    if (LEVEL.ERROR <= globalLevel) {
        log(LEVEL.ERROR, util.format.apply(null, arguments))
    }
}

//导出
module.exports = {
    info: info,
    warn: warn,
    error: error,
    LEVEL: LEVEL,
    setLevel: setLevel,
    setColoredOutput: setColoredOutput
}
