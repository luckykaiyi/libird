var utils = {
    parseReqHeaders: function(s) {
        var req = {}, tmpArr = [];
        var reqHeaders = s.split('\n');
        var reqLine = reqHeaders[0].split(' ');
        req.method = reqLine[0];
        req.uri = reqLine[1];
        req.protocol = reqLine[2];
        req.params = {};
        if (req.uri.indexOf('?') == -1) {
            req.path = req.uri;
            req.querystring = '';
            req.query = {};
        } else {
            tmpArr = req.uri.split('?');
            req.path = tmpArr[0];
            req.querystring = tmpArr[1];
            req.query = this.parseQueryString(req.querystring);
        }
        for(var i = 1; i < reqHeaders.length; i++) {
            tmpArr = reqHeaders[i].split(':');
            req[tmpArr[0]] = tmpArr[1];
        }
        return req;
    },
    parseQueryString: function(s) {
        var query = {};
        var arr = s.split('&');
        var tmp;
        for (var i = 0; i < arr.length; i++) {
            tmp = arr[i].split('=');
            query[tmp[0]] = tmp[1];
        }
        return query;
    },
    trim: function(s) {
        return s.replace(/^\s+|\s+$/g,"");     
    },
    getContentType: function(req) {
        var type = '';
        if (req.path.indexOf('.html') != -1 || (req.Accept && req.Accept.indexOf('html') != -1)) {
            type = 'text/html';
        } else if (req.path.indexOf('.css') != -1 || (req.Accept &&req.Accept.indexOf('css') != -1)) {
            type = 'text/css';
        } else if (req.path.indexOf('.js') != -1 || (req.Accept && req.Accept.indexOf('js') != -1)) {
            type = 'application/js';
        } else if (req.Accept && req.Accept.indexOf('json') != -1) {
            type = 'application/json';
        } else {
            type = req.Accept;
        }
        return type + ';charset=utf-8';
    },
    matchRouter: function(path, list) {
        if (list[path]) {
            return path;
        }
        var p = new RegExp(/^\/[a-zA-Z]+\/[a-zA-Z0-9]+$/);
        if (!p.test(path)) {
            return false;
        }
        var start = path.match(/^\/[a-zA-Z]+\//)[0];
        for(var i in list) {
            if(i.search(start) == 0) {
                return i;
            }
        }
        return false
    }
}
module.exports = utils;
