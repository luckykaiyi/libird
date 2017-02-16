var libird = require('./index.js')
var router = libird.router;

libird.setDirPath('./test');

router.get('/user', function(req, res) {
    var userid = req.getSession('userid');
    var status = userid ? '已登录' : '未登录';
    res.send(status);
});
router.get('/detail/:id', function(req, res) {
    res.send('req.params.id=' + req.params.id);
});
router.post('/login', function(req, res) {
    res.setCookie('userid', '111111');
    res.send(req.body);
});
router.post('/logout', function(req, res) {
    res.clearCookie('userid');
    res.send({"success": true});
});

libird.start(8888);


