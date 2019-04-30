'use strict'

var express = require('express');
var UserController = require('../controllers/user');

//milddleware
var md_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/users'});

var api = express.Router();

api.get('/home', UserController.home);

api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);

api.post('/register', UserController.saveUser);

api.post('/login', UserController.loginUser);

//consultar usuario por ID
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
//consultar lista usuario por ID
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
//updae User
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
//upload image user
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
//get image user
api.get('/get-image-user/:imageFile', md_auth.ensureAuth, UserController.getImageFile);
//get  counts
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);

module.exports = api;
