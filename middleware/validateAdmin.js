var jwt = require('../utils/jwt');
var dbhandler = require("../handlers/dbhandler");
var crypto = require('crypto');

module.exports = function(req, res, next) {

    if (!req.headers.authorization) {
        console.log(req.url)
        if (req.url == '/api/register')
        {
            return next();
        }
        return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.headers.authorization.split(' ');
    var AUTH_TYPE = token[0];
    var payload = null;
    if (AUTH_TYPE.toLowerCase() == "bearer") {
        try {
            payload = jwt.decodeBearerToken(token[1]);
        }
        catch (err) {
            return res.status(401).send({message: err.message});
        }

        if (payload.exp <= Date.now()) {
            return res.status(401).send({message: 'Token has expired'});
        }
        req.user = payload.user;
        next();
    }
    else if (AUTH_TYPE.toLowerCase() == "basic")
    {
        try {
            payload = jwt.decodeBasicToken(token[1]);

        }
        catch (err) {
            return res.status(401).send({message: err.message});
        }
        var hashed_password = crypto.createHash('md5').update(payload.password).digest("hex");
        req.username = payload.username;
        req.passwordHash = hashed_password;
        next();
    }
};