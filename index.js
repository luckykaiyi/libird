var http = require('http');
var url = require('url');
var fs = require('fs');
var utils = require('./lib/utils.js');
var crypto = require('crypto');

var libird = {
    port: 8888,
    dirPath: './',
    router: {
        list: {
            get:{},
            post:{}
        },
        get: function(path, cb) {
            libird.setRouter('get', path, cb);
        },
        post: function(path, cb) {
            libird.setRouter('post', path, cb);
        }
    },
    session: {},
    setPort: function(port) {
        this.port = port;
    },
    setDirPath: function(path) {
        this.dirPath = path;
    },
    setRouter: function(method, path, cb) {
        var index = path.indexOf(':');
        var withParam, param;
        if(index == -1) {
            withParam = false;
            param = null;
        } else {
            withParam = true;
            param = path.substring(++index);
        }
        this.router.list[method][path] = {
            withParam: withParam,
            param: param,
            run:cb
        };
    },
    runRouter: function(method, path, req, res) {
        this.router.list[method][path].run(req, res);
    },
    server: http.createServer(function(req, res) {
        res.send = function(data) {
            if (typeof data == 'object') {
                data = JSON.stringify(data); 
            } else if (typeof data == 'number') {
                data = data.toString();
            }
            res.statusCode = 200;
            res.end(data);
        };
        if(req.headers.cookie) {
            req.cookies = utils.parseCookie(req.headers.cookie);
        }
        res.setCookie = function(k,v) {
            var value = v.toString() + new Date().getTime();
            var hash = crypto.createHash('md5').update(value).digest('hex');
            if (k in libird.session) {
                libird.session[k][hash] = v;
            } else {
                libird.session[k] = {};
                libird.session[k][hash] = v;
            }
            var s = k + '=' + hash + '; Path=/;';
            res.setHeader('Set-Cookie', s);
        };
        res.clearCookie = function(k) {
            var s = k + "=; Path=/;";
            var cookie = req.cookies[k];
            if (k in libird.session) {
                delete libird.session[k][cookie];
            }
            res.setHeader('Set-Cookie', s);
        };
        req.getSession = function(k) {
            var cookie = req.cookies[k];
            var session = '';
            if (k in libird.session) {
                session = libird.session[k][cookie];
            }
            return session;
        };
        var reqUrl = url.parse(req.url, true);
        req.pathname = reqUrl.pathname;
        req.query = reqUrl.query;
        res.setHeader('Content-Type', utils.getContentType(req));
        var pathname = req.pathname; 
        var method = req.method.toLowerCase();
        var routerPath = utils.matchRouter(pathname, libird.router.list[method]);
        if(routerPath) {
            var item =libird.router.list[method][routerPath];
            if (item.withParam) {
                req.params = {};
                var k = item.param;
                var v = pathname.match(/[^\/]+$/)[0];
                req.params[k] = v;
            }
            if(method == 'post') {
                var body = '';
                req.on('data', function(data) {
                    body += data;
                })
                req.on('end', function() {
                    if (body) {
                        var type = req.headers['content-type'];
                        if (type.indexOf('x-www-form-urlencoded') != -1)  {
                            req.body = utils.parseQueryString(body);
                        } else if (type.indexOf('json') != -1) {
                            req.body = JSON.parse(body);
                        } else {
                            req.body = body;
                        }
                    }
                    libird.runRouter(method, routerPath, req, res);
                })
            } else {
                libird.runRouter(method, routerPath, req, res);
            }
        } else {
            if (pathname == '/') {
                pathname = '/index.html'
            }
            var filePath = libird.dirPath + pathname;
            fs.readFile(filePath, 'utf-8', function(err, data) {
                if(err) {
                    console.log(err);
                    res.statusCode = 404;
                    res.end('404 Not Found!');
                }else {
                    res.statusCode = 200;
                    res.end(data);
                }
            })
        }
    }),
    start: function(port) {
        if(port) {
            this.setPort(port);
        }
        this.server.listen(this.port, function(){
            console.log('server listening at:' + libird.port);
        });
    }
}
module.exports = libird;
