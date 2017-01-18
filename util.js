var check = require('check-types');
var log4js = require('log4js');
var fs = require('fs');
if (fs.existsSync(process.cwd() + '/log4js.json')) {
    log4js.configure(process.cwd() + '/log4js.json');
} else {
    log4js.configure(__dirname + '/log4js.json');
}
var log = log4js.getLogger('logging');

exports.validate = function(config, option) {
    var errors = [];
    log.debug(">ENTER validate");
    let u = require('url').parse(option.url);
    if (u.protocol != "mongodb:") {
        errors.push("INVALID PROTCOL in url: " + JSON.stringify(u));
    }
    var schema = config.argv;
    var argv = option.argv;
    for (let key in schema) {
        log.trace("key:" + key + " has " + schema[key].validate.length + " constrains");
        for (let n = 0; n < schema[key].validate.length; n++) {
            let constrain = "";
            let opt = {};
            if (check.object(schema[key].validate[n])) {
                let k = Object.keys(schema[key].validate[n]);
                constrain = k[0];
                opt = schema[key].validate[n][constrain];
            } else if (check.nonEmptyString(schema[key].validate[n])) {
                constrain = schema[key].validate[n];
                opt = null;
            } else {
                throw new TypeError("Incorrect schema(" + key + "):" + JSON.stringify(schema[key].validate[n]));
            }
            log.trace("\constrain:" + constrain);
            if (check.undefined(argv[key])) {
                if (constrain == "required") {
                    errors.push("Invalid argv: " + key + " is required");
                } else if (constrain == "default") {
                    log.trace("\tSet default(" + key + "):" + opt);
                    argv[key] = opt;
                }
            } else {
                let result = validateValue(constrain, key, argv[key], opt);
                if (result != null) {
                    errors.push(result);
                }
            }
        }
    }
    if (!config.output.validate.find(function(v) { return v == option.output })) {
        errors.push("Invalid output: output has to take one of [" + config.output.validate.join(",") + "] but given " + option.output);
    }
    if (errors.length > 0) {
        return errors;
    } else {
        return true;
    }
}

function validateValue(constrain, key, value, opt) {
    switch (constrain) {
        case "required":
            break;
        case "number":
            if (!check.number(value)) {
                return "Invalid argv: " + key + " must be number, but given " + value;
            }
            break;
        case "integer":
            if (!check.integer(value)) {
                return "Invalid argv: " + key + " must be integer, but given " + value;
            }
            break;
        case "boolean":
            if (!check.boolean(value)) {
                return "Invalid argv: " + key + " must be boolean, but given " + value;
            }
            break;
        case "object":
            if (!check.object(value)) {
                return "Invalid argv: " + key + " must be object, but given " + value;
            }
            break;
        case "array":
            if (!check.array(value)) {
                return "Invalid argv: " + key + " must be array, but given " + value;
            }
            break;
        case "between":
            if (!check.between(value, opt.min, opt.max)) {
                return "Invalid argv: " + key + " must be between (" + opt.min + ", " + opt.max + "), but given " + value;
            }
            break;
        case "inRange":
            if (!check.inRange(value, opt.min, opt.max)) {
                return "Invalid argv: " + key + " must be in Range of (" + opt.min + ", " + opt.max + "), but given " + value;
            }
            break;
        case "greater":
            if (!check.greater(value, opt)) {
                return "Invalid argv: " + key + " must be > " + opt + ", but given " + value;
            }
            break;
        case "greaterOrEqual":
            if (!check.greaterOrEqual(value, opt)) {
                return "Invalid argv: " + key + " must be >= " + opt + ", but given " + value;
            }
            break;
        case "less":
            if (!check.less(value, opt)) {
                return "Invalid argv: " + key + " must be < " + opt + ", but given " + argv[key];
            }
            break;
        case "lessOrEqual":
            if (!check.lessOrEqual(value, opt)) {
                return "Invalid argv: " + key + " must be <= " + opt + ", but given " + value;
            }
            break;
        case "in":
            if (!opt.find(function(v) { return v == value })) {
                return "Invalid argv: " + key + " has to take one of " + JSON.stringify(opt) + ", but given " + value;
            }
            break
        case "positive":
            if (!check.positive(value)) {
                return "Invalid argv: " + key + " must be positive, but given " + value;
            }
            break;
        case "negative":
            if (!check.negative(value)) {
                return "Invalid argv: " + key + " must be negative, but given " + value;
            }
            break;
        default:
            throw new TypeError("Incorrect schema(" + key + ") constrain(" + constrain + ")");
    }
    return null;
}