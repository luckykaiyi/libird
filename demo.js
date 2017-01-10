var libird = require('./index.js')
var fn = function(req) {
    return 'hello world';
};
libird.setRouter('/demo', fn);
libird.start(8899);
console.log(libird.port)


