module.exports = {
    parseReqHeaders: function(s) {
        var reqData = {};
        var reqHeadersArr = s.split('\n');
        var tmpArr = reqHeadersArr[0].split(' ');
        reqData.method = tmpArr[0];
        reqData.path = tmpArr[1];
        reqData.protocol = tmpArr[2];
        for(var i = 1; i < reqHeadersArr.length; i++) {
            tmpArr = reqHeadersArr[i].split(':');
            reqData[tmpArr[0]] = tmpArr[1];
        }
        return reqData;
    }
}
