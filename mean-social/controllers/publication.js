'use strict'

//resources
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

//models
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function test(req, res) {
    return res.status(200).send({message: 'Hello World Test Publication'});
}

function savePublication(req, res) {
    var params = req.body;

    if(!params.text) return releaseEvents.status(200).send({message: 'Require Text Description'});

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at =  moment().unix();

    console.log(publication);
    publication.save((err, publicationStored) => {
        if(err) return res.status(500).send({message: 'Error en el servicio Publication'});

        if(!publicationStored) return releaseEvents.status(404).send({message: 'Not Save Publication'});

        return res.status(200).send({publication: publicationStored});
    });
}

function getPublications(req, res) {
    var userId = req.user.sub;
    var page = 1;

    if(req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;
    try {
        Follow.find({user: userId}).populate('followed').exec()
            .then((follows) => {
                var follows_clean =[];

                follows.forEach((follow) => {
                    follow.followed.password = undefined;
                    follows_clean.push(follow.followed);
                });
                // console.log(follows_clean);

                Publication.find({user: {'$in': follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
                    if(err) return res.status(500).send({message: 'Error en el servidor'});

                    if(!publications) return releaseEvents.status(404).send({message: 'Not Found Publications'});
                    // console.log(publications)
                    publications.forEach((publication) => {
                        var pub_user = publication.user;
                        // console.log(pub_user);
                        pub_user.password = undefined;
                    });
                    return res.status(200).send({
                        total_items: total,
                        pages: Math.ceil(total/itemsPerPage),
                        page: page,
                        publications
                    });
                });
            });
    } catch (e) {
        console.log(e);
    }
}


function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: 'Error Servidor'});

        if(!publication) return res.status(404).send({message: 'Publication Not Found'})

        return res.status(200).send({publication});
    });
}

function deletePublication(req, res) {
    var publicationId = req.params.id;
    var userId = req.user.sub;

    // Publication.findByIdAndRemove(publicationId, (err, publicarionRemove) => {
    Publication.find({user: userId, '_id': publicationId}).remove((err) => {
        if(err) return res.status(500).send({message: 'Error Servidor'});

        // if(!publicarionRemove) return res.status(404).send({message: 'Publication Not Remove'})
        // return res.status(200).send({publicarionRemove});
        return res.status(200).send({message: 'Success Delete Publications'});
    });
}

//subir avatar
function uploadImage(req, res) {
    var publicationId = req.params.id;
    var userId = req.user.sub;

    if(req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var file_extension_split = file_name.split('\.');
        var file_extension =  file_extension_split[1];

        if(file_extension == 'png' || file_extension == 'jpeg' || file_extension == 'jpg' || file_extension == 'gif') {
          
            Publication.findOne({'user': userId, '_id': publicationId}).exec()
                .then((publicationUpload) => {
                    //update image user Publication
                    if(publicationUpload){
                        Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publicationUpdated) => {
                            if(err) return res.status(500).send({message: 'Error en el servidor'});
    
                            if(!publicationUpdated) return res.status(404).send({message: 'Updated Image faild'});
    
                            return res.status(200).send({publication: publicationUpdated});
                        });
                    } else {
                        return removeFilesOfuUploads(res, file_path, 'Invalid Permite')
                    }
                });
         
        } else {
           return removeFilesOfuUploads(res, file_path, 'Imagen Extension It Does Not Validate')
        }
        
    } else {
        return res.status(200).send({message: 'Not Load Image'});
    }
}

//get imagen 
function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/publications/'+image_file;
   
    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'Not found Image...'});
        }
    });
}

module.exports = {
    test,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}