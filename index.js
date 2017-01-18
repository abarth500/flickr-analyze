var check = require('check-types');
var log4js = require('log4js');
var fs = require('fs');
if (fs.existsSync(process.cwd() + '/log4js.json')) {
    log4js.configure(process.cwd() + '/log4js.json');
} else {
    log4js.configure(__dirname + '/log4js.json');
}
var log = log4js.getLogger('logging');
var pap = require("posix-argv-parser");
var queries = {};

var filenames = fs.readdirSync(__dirname + "/query/");
for (i = 0; i < filenames.length; i++) {
    let stat = fs.statSync(__dirname + "/query/" + filenames[i]);
    if (stat.isFile()) {
        let mod = require(__dirname + "/query/" + filenames[i]);
        let conf = mod.config
        if (!check.undefined(conf.name) && !check.undefined(conf.description)) {
            queries[conf.name] = mod;
        }
    }
}

exports.query = function(query, options, callback) {
    if (check.undefined(queries[query])) {
        throw new Error("Invalid Queiry Command:" + query);
    } else {
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(options.url, function(err, db) {
            if (err) {
                log.fatal('MONGODB-> Connection Error');
                throw new Error("mongodb error:", err);
            }
            log.debug(JSON.stringify(options));
            queries[query].init(options);
            queries[query].run(callback, db.collection(options.col), log);
        })

    }
};

exports.list = function() {
    return queries;
}