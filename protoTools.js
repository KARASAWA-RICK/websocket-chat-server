//Buffer操作


const log = require('./utils/log')



//创建Buffer
function allocBuffer(totalLen) {
    return Buffer.allocUnsafe(totalLen)
}



//读写数字
function readInt16(buf, offset) {
    return buf.readInt16LE(offset)
}
function writeInt16(buf, offset, value) {
    buf.writeInt16LE(value, offset)
}
function readInt32(buf, offset) {
    return buf.readInt32LE(offset)
}
function writeInt32(buf, offset, value) {
    buf.writeInt32LE(value, offset)
}
function readUint32(buf, offset) {
    return buf.readUInt32LE(offset)
}
function writeUint32(buf, offset, value) {
    buf.writeUInt32LE(value, offset)
}
function readFloat(buf, offset) {
    return buf.readFloatLE(offset)
}
function writeFloat(buf, offset, value) {
    buf.writeFloatLE(value, offset)
}




//读写字符串
function readStr(buf, offset, byteLen) {
    return buf.toString("utf8", offset, offset + byteLen)
}
function writeStr(buf, offset, str) {
    buf.write(str, offset)
}


//读写消息头
function readHeaderInBuffer(buf) {
    let stype = readInt16(buf, 0)
    let ctype = readInt16(buf, 2)
    let utag = readUint32(buf, 4)
    let protoType = readInt16(buf, 8)
    let byteLen = readInt16(buf, 10)
    return {
        0: stype,
        1: ctype,
        2: utag,
        3: protoType,
        4: byteLen
    }
}
function writeHeaderInBuffer(buf, stype, ctype, utag, protoType, byteLen) {
    writeInt16(buf, 0, stype)
    writeInt16(buf, 2, ctype)
    writeUint32(buf, 4, utag)
    writeInt16(buf, 8, protoType)
    writeInt16(buf, 10, byteLen)
}


//单独写入消息体中转类型
function writeProtoTypeInBuffer(buf, protoType) {
    writeInt16(buf, 8, protoType)
}
//单独写入utag
function writeUtagInbuf(buf, utag) {
    writeInt16(buf, 4, utag)
}
//清除utag
function clearUtagInbuf(buf) {
    writeInt16(buf, 4, 0)
}



//读写消息体字符串
function readStrInBuffer(buf) {
    let byteLen = readInt16(buf, 10)
    let payLoadJson = readStr(buf, 12, byteLen)
    return payLoadJson
}
function writeStrInBuffer(buf, payLoadJson) {
    writeStr(buf, 12, payLoadJson)
}




module.exports = {
    headerSize: 12, // 2 + 2 + 4 + 2 +2

    allocBuffer,

    readInt16,
    writeInt16,
    readInt32,
    writeInt32,
    readFloat,
    writeFloat,
    readUint32,
    writeUint32,

    writeProtoTypeInBuffer,
    writeUtagInbuf,
    clearUtagInbuf,

    readHeaderInBuffer,
    writeHeaderInBuffer,

    writeStrInBuffer,
    readStrInBuffer,
}
