'use strict'

var express = require('express');

//controllers
var MessageController = require('../controllers/message');

//milddleware
var md_auth = require('../middlewares/authenticated');

//var multiparty = require('connect-multiparty');
// var md_upload = multiparty({uploadDir: './uploads/users'});

//router
var api = express.Router();

api.get('/test-message', md_auth.ensureAuth, MessageController.test);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceiveMessages);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getReceiveMessages);
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;