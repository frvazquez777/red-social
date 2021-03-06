'use strict'

var express = require('express');

var PublicationController  = require('../controllers/publication');

var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications'});

var api = express.Router();

api.get('/test-publication', md_auth.ensureAuth, PublicationController.test);
api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id?', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id?', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/upload-image-pub/:id?', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
api.get('/get-image-pub/:imageFile', md_auth.ensureAuth, PublicationController.getImageFile);

module.exports = api;