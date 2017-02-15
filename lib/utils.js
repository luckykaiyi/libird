var utils = {
    parseReqHeaders: function(s) {
        var req = {}, tmpArr = [];
        var reqSections = s.split('\r\n\r\n');
        var reqHeader = reqSections[0];
        var reqBody = reqSections[1];
        var reqHeaderItems = reqHeader.split('\r\n');
        var reqLine = reqHeaderItems[0].split(' ');
        req.method = reqLine[0];
        req.uri = reqLine[1];
        req.protocol = reqLine[2];
        req.params = {};
        if (req.uri && req.uri.indexOf('?') == -1) {
            req.path = req.uri;
            req.querystring = '';
            req.query = {};
        } else {
            tmpArr = req.uri.split('?');
            req.path = tmpArr[0];
            req.querystring = tmpArr[1];
            req.query = this.parseQueryString(req.querystring);
        }
        for(var i = 1; i < reqHeaderItems.length; i++) {
            tmpArr = reqHeaderItems[i].split(':');
            req[tmpArr[0]] = tmpArr[1];
        }
        if (reqBody) {
            req.body = JSON.parse(reqBody);
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
        var pathname = req.pathname; 
        var accept = req.headers.accept;
        if (pathname.indexOf('.html') != -1 || (accept && accept.indexOf('html') != -1)) {
            type = 'text/html';
        } else if (pathname.indexOf('.css') != -1 || (accept && accept.indexOf('css') != -1)) {
            type = 'text/css';
        } else if (pathname.indexOf('.js') != -1 || (accept && accept.indexOf('js') != -1)) {
            type = 'application/js';
        } else if (accept && accept.indexOf('json') != -1) {
            type = 'application/json';
        } else {
            type = accept;
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
        return false;
    },
    parseCookie: function(s) {
        var cookies = {};
        var items = s.split(';');
        items.forEach(function(item) {
            var arr = utils.trim(item).split('=');
            cookies[arr[0]] = arr[1] || '';
        })
        return cookies;
    }
}
module.exports = utils;
