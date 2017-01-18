var colPhoto = 'flickr_photo';
var MongoClient = require('mongodb').MongoClient;

var pap = require("posix-argv-parser");
var v = pap.validators;
var args = pap.create();
var log4js = require('log4js');
var fs = require('fs');
if (fs.existsSync(process.cwd() + '/log4js.json')) {
    log4js.configure(process.cwd() + '/log4js.json');
} else {
    log4js.configure(__dirname + '/log4js.json');
}
var log = log4js.getLogger('logging');

args.createOption(["-q", "--query"], {
    description: "Query command name",
    validators: [v.required()],
    defaultValue: ""
});

args.createOption(["-a", "--argv"], {
    description: "Query Command Arguments",
    validators: [v.required()],
    transform: function(value) {
        return JSON.parse(value);
    },
    defaultValue: {}
});
args.createOption(["-s", "--strage"], {
    description: "MongoDB Connection URL (e.g. mongodb://localhost:27017/flickr-crawler)",
    validators: [v.required()],
    defaultValue: ""
});
args.createOption(["-c", "--collection"], {
    description: "MongoDB Collection Prefix(e.g. flickr)",
    validators: [],
    defaultValue: "flickr"
});
args.parse(process.argv.slice(2), function(errors, options) {
    if (errors) {
        errors.forEach(function(er) {
            log.fatal(er);
        });
        console.log("\n[USAGE]");
        args.options.forEach(function(opt) {
            console.log("    " + opt.signature + (Array(21 - opt.signature.length).join(" ")) + ": " + opt.description);
        });
        process.exit(1);
    }
    var query = options["--query"].value;
    var argv = options["--argv"].value;
    var url = options["--strage"].value;
    var col = options["--collection"].value + "_photo";

    var analize = require("./index.js");
    analize.query(query, {
        url: url,
        col: col,
        argv: argv,
        output: 'result'
    }, function(err, result) {
        console.log(err, result);
        process.exit(0);
    });
    /*
    MongoClient.connect(url, function(err, db) {
        if (err) {
            log.fatal('MONGODB-> Connection Error');
            throw new Error("mongodb error:", err);
        }
        var func = null;
        switch (cmd) {
            case "nPhoto":
                func = require(__dirname + '/query/n_photo.js');
                break;
            default:
                log.fatal("Command(" + cmd + ") Not Founds");
                process.exit(1);
        }
        var collection = db.collection(colPhoto);
        func.run(log, collection, opt, function(err) {
            process.exit(0);
        });
    })
    */
});