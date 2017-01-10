var net = require('net');
var fs = require('fs');
var utils = require('./lib/utils.js');

var libird = {
    port: 8888,
    dirPath: './',
    router: {},
    setPort: function(port) {
        this.port = port;
    },
    setDirPath: function(path) {
        this.dirPath = path;
    },
    setRouter: function(reqPath, cb) {
        this.router[reqPath] = cb;
    },
    server: net.createServer(function(sock) {
        sock.on('data', function(data) {
            var reqData = utils.parseReqHeaders(data.toString());
            var reqPath = reqData.path;
            if (reqPath == '/') {
                reqPath = '/index.html';
            }
            var resBody, resHeader, resData;
            if(libird.router[reqPath]) {
                resBody = libird.router[reqPath](reqData);
                resHeader = 'HTTP/1.1 200 OK\nContent-Type: ' + reqData.Accept + '\nContent-Length: ' + resBody.length + '\n\n';
                resData = resHeader + resBody;
                sock.write(resData);
            }else {
                var filePath = libird.dirPath + reqPath;
                fs.readFile(filePath, 'utf-8', function(err, data) {
                    if(err) {
                        console.log(err);
                        resBody = '404 Not Found!'
                        resHeader = 'HTTP/1.1 404 NotFound\nContent-Type: ' + reqData.Accept + '\nContent-Length: ' + resBody.length + '\n\n';
                    }else {
                        resBody = data;
                        resHeader = 'HTTP/1.1 200 OK\nContent-Type: ' + reqData.Accept + '\nContent-Length: ' + resBody.length + '\n\n';
                    }
                    resData = resHeader + resBody;
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
