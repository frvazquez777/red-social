'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');

//milddleware
var md_auth = require('../middlewares/authenticated');

//var multiparty = require('connect-multiparty');
// var md_upload = multiparty({uploadDir: './uploads/users'});

//router
var api = express.Router();

api.get('/test', md_auth.ensureAuth, FollowController.test);
api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getUserFollowed);
api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);

module.exports = api;
