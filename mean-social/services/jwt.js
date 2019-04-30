'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'ing_fredy_vazquez_isc_itcampeche';

exports.createToken = function(user) {
    var userToken = user.user;
    var payload = {
        sub: userToken._id,
        name: userToken.name,
        surname: userToken.surname,
        nick: userToken.nick,
        email: userToken.email,
        role: userToken.role,
        image: userToken.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    return jwt.encode(payload, secret);

};

