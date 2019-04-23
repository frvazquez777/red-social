'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'ing_fredy_vazquez_isc_itcampeche';

exports.ensureAuth = function(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(403).send({message: 'Proceso no autorizado'});
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()){
            return res.status(401).send({message: 'Token expired'});
        } 
    } catch (ex) {
        return res.status(404).send({message: 'token Invalid'});
    }

    req.user = payload;

    next();
}