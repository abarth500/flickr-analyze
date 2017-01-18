var check = require('check-types');
var log4js = require('log4js');
var fs = require('fs');
if (fs.existsSync(process.cwd() + '/log4js.json')) {
    log4js.configure(process.cwd() + '/log4js.json');
} else {
    log4js.configure(__dirname + '/log4js.json');
}
var log = log4js.getLogger('logging');
var util = require('../util.js');

var config = {
    name: "getNumberOfPhotographsAround",
    description: "Get number of photographs around given location within given distance.",
    argv: {
        lat: {
            description: "Latitude of query center.",
            validate: ["required", "number", { between: { min: -90, max: 90 } }],
        },
        lon: {
            description: "Longitude of query center.",
            validate: ["required", "number", { between: { min: -180, max: 180 } }],
        },
        distance: {
            description: "Radius from query center.",
            validate: ["required", "integer", "positive"]
        },
        donuts: {
            description: "(Option) minDistance of radius query.",
            validate: [{ delault: null }, "integer", "positive"]
        },
        limit: {
            description: "(Option) like SQL limit",
            validate: [{ default: 1000000 }, "integer", "positive"]
        }
    },
    output: {
        description: "This query returens one single integer, a number of photographs.",
        validate: ["result", "value"]
    }
}
exports.config = config;

/* var url = "mongodb://localhost:27017/flickr-crawler"; */
/* var col = "flickr_photo"; */
var output = "result";
var argv = {};

exports.init = function(opt) {
    let vld = util.validate(config, opt);
    if (vld === true) {
        /*
        if (!check.undefined(opt.url)) {
            url = opt.url;
        }
        if (!check.undefined(opt.col)) {
            col = opt.col;
        }
        */
        if (!check.undefined(opt.output)) {
            output = opt.output;
        }
        if (!check.undefined(opt.argv)) {
            argv = opt.argv;
        }
    } else {
        throw new Error(vld.join(", "));
    }

};

exports.run = function(callback, col, log = null) {
    if (log != null) {
        log.debug("LOAD MODULE: Number of Photographs");
    }
    let geoNear = {
        "$geoNear": {
            near: { type: "Point", coordinates: [argv.lon, argv.lat] },
            distanceField: "distance",
            maxDistance: argv.distance,
            spherical: true,
            limit: argv.limit
        }
    };
    if (argv.donuts != null) {
        geoNear.$geoNear.minDistance = option.dounuts;
    }
    log.info(JSON.stringify(argv));
    col.aggregate(
        [
            geoNear,
            {
                $project: { _id: 1 }
            }
        ], {},
        function(err, result) {
            if (err) {
                log.error(err);
                throw err;
            }
            if (log != null) {
                if (err) {
                    log.error("MONGODB ERROR: Number of Photographs: " + JSON.stringify(err));
                } else {
                    log.debug("MONGODB RETURN: Number of Photographs: " + result.length);
                }
            }
            returnOutput(err, result.length, callback);
        }
    );
}

function returnOutput(err, value, callback) {
    var rtn;
    switch (output) {
        case "result":
            rtn = { "stat": "ok", "return": value };
            break;
        case "value":
            rtn = value;
            break;
    }
    callback(err, rtn);
}