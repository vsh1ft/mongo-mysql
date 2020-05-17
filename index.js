var spinner = require("char-spinner");
var async = require("async");
spinner();

var dataSize = 4000;


async.series([
    /* == INSERT == */
    function (callback) {
        require('./postgresql')('insert', dataSize, callback);
    },
    function (callback) {
        require('./mysql')('insert', dataSize, callback);
    },
    function (callback) {
        require('./mongo')('insert', dataSize, callback);
    },

    function (callback) {
        require('./mysql')('find', dataSize, callback);
    },
    function (callback) {
        require('./mongo')('find', dataSize, callback);
    },
    function (callback) {
        require('./postgresql')('find', dataSize, callback);
    },
], function () {
    process.exit();
})
