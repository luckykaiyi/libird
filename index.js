var net = require('net');
var fs = require('fs');
var utils = require('./lib/utils.js');

var libird = {
    port: 8888,
    dirPath: './',
    router: {
        list: {},
        get: function(path, cb) {
            libird.setRouter(path, cb);
        }
    },
    setPort: function(port) {
        this.port = port;
    },
    setDirPath: function(path) {
        this.dirPath = path;
    },
    setRouter: function(path, cb) {
        var index = path.indexOf(':');
        var withParam, param;
        if(index == -1) {
            withParam = false;
            param = null;
        } else {
            withParam = true;
            param = path.substring(++index);
        }
        this.router.list[path] = {
            withParam: withParam,
            param: param,
            run:cb
        };
    },
    runRouter: function(path, req, res) {
        this.router.list[path].run(req, res);
    },
    server: net.createServer(function(sock) {
        sock.on('data', function(data) {
            var req = utils.parseReqHeaders(data.toString());
            var res = {
                header: {
                    protocol: 'HTTP/1.1',
                    status: '200 OK',
                    contentType: utils.getContentType(req),
                },
                body:'',
                getResData: function() {
                    var resHeader = this.header.protocol + ' ' + this.header.status + '\n' + 'Content-Type:' + this.header.contentType + '\n' + 'Content-Length:' + Buffer.byteLength(this.body, 'utf-8') + '\n\n';
                    var resBody = this.body;
                    var resData = resHeader + resBody;
                    return resData;
                },
                send:function(data) {
                    this.body = JSON.stringify(data);
                    var resData = this.getResData();
                    sock.write(resData);
                }
            };
            var path = req.path;
            var routerPath = utils.matchRouter(path, libird.router.list);
            if(routerPath) {
                var item =libird.router.list[routerPath];
                if (item.withParam) {
                    var k = item.param;
                    var v = path.match(/[^\/]+$/)[0];
                    req.params[k] = v;
                }
                libird.runRouter(routerPath, req, res);
            } else {
                if (path == '/') {
                    path = '/index.html'
                }
                var filePath = libird.dirPath + path;
                fs.readFile(filePath, 'utf-8', function(err, data) {
                    if(err) {
                        console.log(err);
                        res.header.status = '404 Not Found';
                        res.body = '404 Not Found!';
                    }else {
                        res.body = data;
                    }
                    var resData = res.getResData();
                    sock.write(resData);
                })
            }
        })
    }),
    start: function(port) {
        if(port) {
            this.setPort(port);
        }
        this.server.listen(this.port, function() {
            console.log('libird listening at:' + libird.port);
        })
    }
}
module.exports = libird;
