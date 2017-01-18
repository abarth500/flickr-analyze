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
    let u = require('url').parse(option.url);
    if (u.protocol != "mongodb:") {
        errors.push("INVALID PROTCOL in url: " + JSON.stringify(u));
    }
    var schema = config.argv;
    var argv = option.argv;
    for (let key in schema) {
        for (let n = 0; n < schema[key].length; n++) {
            let constrain = "";
            let opt = {};
            if (check.object(schema[key][n])) {
                let k = Object.keys(schema[key][n]);
                constrain = k[0];
                opt = schema[key][n][constrain];
            } else if (check.nonEmptyString(schema[key][n])) {
                constrain = check.nonEmptyString(schema[key][n]);
            } else {
                throw new TypeError("Incorrect schema(" + key + ")");
            }
            if (check.undefiend(argv[key])) {
                if (constrain == "required") {
                    errors.push("Invalid argv: " + key + " is required");
                } else if (constrain == "default") {
                    argv[key] = opt;
                }
            } else {
                switch (constrain) {
                    case "default":
                        break;
                    case "number":
                        if (!check.number(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be number, but given " + argv[key]);
                        }
                        break;
                    case "integer":
                        if (!check.integer(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be integer, but given " + argv[key]);
                        }
                        break;
                    case "boolean":
                        if (!check.boolean(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be boolean, but given " + argv[key]);
                        }
                        break;
                    case "object":
                        if (!check.object(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be object, but given " + argv[key]);
                        }
                        break;
                    case "array":
                        if (!check.array(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be array, but given " + argv[key]);
                        }
                        break;
                    case "between":
                        if (!check.between(argv[key], opt.min, opt.max)) {
                            errors.push("Invalid argv: " + key + " must be between (" + opt.min + ", " + opt.max + "), but given " + argv[key]);
                        }
                        break;
                    case "inRange":
                        if (!check.inRange(argv[key], opt.min, opt.max)) {
                            errors.push("Invalid argv: " + key + " must be in Range of (" + opt.min + ", " + opt.max + "), but given " + argv[key]);
                        }
                        break;
                    case "greater":
                        if (!check.greater(argv[key], opt)) {
                            errors.push("Invalid argv: " + key + " must be > " + opt + ", but given " + argv[key]);
                        }
                        break;
                    case "greaterOrEqual":
                        if (!check.greaterOrEqual(argv[key], opt)) {
                            errors.push("Invalid argv: " + key + " must be >= " + opt + ", but given " + argv[key]);
                        }
                        break;
                    case "less":
                        if (!check.less(argv[key]), opt) {
                            errors.push("Invalid argv: " + key + " must be < " + opt + ", but given " + argv[key]);
                        }
                        break;
                    case "lessOrEqual":
                        if (!check.lessOrEqual(argv[key]), opt) {
                            errors.push("Invalid argv: " + key + " must be <= " + opt + ", but given " + argv[key]);
                        }
                        break;
                    case "in":
                        if (!opt.find(function(v) { return v == argv[key] })) {
                            errors.push("Invalid argv: " + key + " has to take one of " + JSON.stringify(opt) + ", but given " + argv[key]);
                        }
                        break
                    case "positive":
                        if (!check.positive(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be positive, but given " + argv[key]);
                        }
                        break;
                    case "negative":
                        if (!check.negative(argv[key])) {
                            errors.push("Invalid argv: " + key + " must be negative, but given " + argv[key]);
                        }
                        break;
                    default:
                        throw new TypeError("Incorrect schema(" + key + ")");
                }
            }
        }
    }
    if (errors.length > 0) {
        return errors;
    } else {
        return true;
    }
}