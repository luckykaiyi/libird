# Libird 

<img src = 'http://7xloce.com1.z0.glb.clouddn.com/libird_logo_v1.0.png' width="300px">

Light Bird Server，基于 Node.js 的 web 开发框架。

## 安装

新建目录或直接进入已有工作目录（假设目录名为 `project` ）

```
$ mkdir project
$ cd project
```
安装 libird

`$ npm install libird`

## 用法示例

下载安装完成后，在 `project` 目录中创建 `libird.js` 文件。  

### 1. 静态资源服务器

```
//引入 libird 模块
var libird = require('libird');

//启动 http server, 默认监听本地8888端口号
libird.start();

// 修改端口号 比如监听本地8989端口号
// libird.start(8989);
```
运行 `$ node libird.js`，后台显示 `server listening at:8888`。
浏览器打开 `http://127.0.0.1:8888` , 针对 `/` 的请求默认查找 `libird.js` 当前所在目录（即 `project` )下的 `index.html` 文件，如果未找到则显示 `404 Not Found!`。  

通过 `HOST/FILEPATH` 可以访问静态资源文件。例如

```
// 访问 project 目录下的 index.css 文件
http://127.0.0.1:8888/index.css  

//访问 project/pages 目录下的 list.html 文件
http://127.0.0.1:8888/pages/list.html 
```
可以为静态文件指定根目录

```
var libird = require('libird');  
libird.setDirPath('./app'); //设置根目录
libird.start();
```
重新运行 `$ node libird.js`。此时 `http://127.0.0.1:8888` 默认查找指定根目录（即`app`)下的 `index.html` 文件。

### 2. 自定义路由

路由基本结构 `router.METHOD(PATH, HANDLER)`, 暂且支持`GET/POST`。基本用法如下：

### GET

```
var libird = require('libird');
var router = libird.router;
router.get('/', function(req, res) {
    res.send('Hello World!');
});
router.get('/detail/:id', function(req, res) {
    res.send('req.params.id=' + req.params.id);
});
libird.start();
```
上述代码运行后将以 `Hello World!` 响应针对`/`的请求。  
访问 `http://127.0.0.1:8888/detail/100`，页面显示 `req.params.id=100`。

### POST

目前支持的 POST 请求 Content-Type为 `json`或 `x-www-form-urlencoded`

```
var libird = require('libird');
var router = libird.router;
router.post('/login', function(req, res) {
    res.setCookie('userid', '111111'); //新增 cookie
    res.send(req.body); 
});
router.post('/logout', function(req, res) {
    res.clearCookie('userid'); // 清除 cookie
    res.send({"success": true});
});
libird.start();
```
运行 `$ node libird.js`。可以通过 Chrome 的插件 Postman 来模拟 POST 请求， 如下所示：

#### 请求

```
POST /login HTTP/1.1
Host: 127.0.0.1:8888
Cache-Control: no-cache
Content-Type: application/x-www-form-urlencoded

username=Lee&password=111
```
libird 将 POST 请求的主体存入`req.body`

#### 响应

上述示例代码的响应即直接显示 `req.body`,

`{"username":"Lee","password":"111"}`

#### Cookie

- 当请求`/login`的时候，新增名为`userid`的 cookie
 `userid  130af17e178815982268491f088dabb3`。  
 
- 当请求`/logout`时清除名为 `userid`的 cookie。
 
- 可通过`req.getSession('userid')`获取原始的 userid (即111111)。比如用于判断用户的登录状态。
  
  ```
   router.get('/user', function(req, res) {
      var userid = req.getSession('userid');
      var status = userid ? '已登录' : '未登录';
      res.send(status);
   });
  ```
--




