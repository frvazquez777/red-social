'use strict'

var mongoosePaginate = require('mongoose-pagination');
var bcrypt = require('bcrypt-nodejs');
var jwt  = require('../services/jwt');
var fs = require('fs');
var path = require('path');

//models
var User = require('../models/user');
var Follow = require('../models/follow');
var publication = require('../models/publication');

function home(req, res) {
    res.status(200).send({
        message: 'Hello World'
    });
}

function pruebas(req, res) {
    res.status(200).send({
        message: 'Hello World Test'
    });
}

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick.toLowerCase();
        user.email = params.email.toLowerCase();
        user.role = 'ROLE_USER';
        user.image = null;

        //controlar los usuarios existentes
        User.find({ $or:  [
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message: 'error en la peticion de usuarios'});

            if(users && users.length >= 1) {
                console.log('valor obtenido '+ users);
                return res.status(200).send({message: 'El usuarios ya esta registrado'});
            } else {
                console.log('valor para guardar '+ users);

                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if(err) return res.status(500).send({ message: 'Error save User'});
        
                        if(userStored){
                            res.status(200).send({
                                user: userStored
                            });
                        } else {
                            res.status(404).send({
                                message: 'User not register'
                            });
                        }
                    });
                });
            }
        });

    } else {
        res.status(200).send({
            message: 'Falta campos necesarios'
        });
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;
    User.findOne({email: email}, (err, user) => {
        if (err) return res.status(500).send({message: 'Error en la peticion'});

        if(user){
            bcrypt.compare(password, user.password, (err, check) => {
                if(check) {

                    if(params.gettoken){
                        //generate and return token
                        return res.status(200).send({
                            token: jwt.createToken({user})
                        });
                    }else {
                        //return data
                        user.password = undefined;
                        return res.status(200).send({user: user});
                    }
                }else {
                    return res.status(200).send({message: 'Usuario/Clave no validas'});
                }
            });
        } else {
            return res.status(404).send({message: 'Usuario/Clave no validas!!!'});
        }
    })
}

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if(err) return res.status(50).send({message: "Error del servidor"});

        if(!user) return res.status(404).send({message: "User not found"});
        // Follow.findOne({'user': req.user.sub, 'followed': userId}).exec((err, follow) => {
        //     if(err) return res.status(500).send({message: "Error del servidor User - Followed"});
        //     return res.status(200).send({user, follow});
        // });
        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user, 
                following: value.following,
                followed: value.followed
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id }).exec()
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id }).exec()
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });
        return {
            following: following,
            followed: followed
        };
    } catch (e) {
        console.log(e);
    }
}

//get list user pagination
function getUsers(req, res) {
    var identity_user = req.user.sub;
    var page = 1;
    if(req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 7;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if(err) return res.status(500).send({message:'Error del servidor'});

        if(!users) return res.status(404).send({message: 'Not Found Users '});

        followUserIds(identity_user).then((value) => {
            //eliminando el campo password
            users.forEach((user) => {
               user.password = undefined;
              });
              //obteniendo los campos
            return res.status(200).send({
                users,
                user_following: value.following,
                user_followed: value.followed,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        });
    });
}

async function followUserIds(user_id) {
    try {
        var following = await Follow.find({'user': user_id}).select({'i_id': 0, '_v': 0, 'user': 0}).exec()
          .then((follows) => {
            return follows;
        })

        var followed = await Follow.find({'followed': user_id}).select({'i_id': 0, '_v': 0, 'followed': 0}).exec()
          .then((follows) => {
            return follows;
        })

        //process follows
        var following_clean =[];
        following.forEach((follow) => {
            following_clean.push(follow.followed);
        });

        var followed_clean =[];
        followed.forEach((follow) => {
            followed_clean.push(follow.user);
        });
        return {  
            following: following_clean,
            followed: followed_clean
        };
    } catch (e) {
        console.log(e);
    }
}

//update user
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //delect campo password
    delete update.password;

    if(userId != req.user.sub) return res.status(403).send({message: 'Not Authorization Updated User'});

    //controlar los usuarios existentes
    User.findOne({ $or:  [
        {email: update.email.toLowerCase()},
        {nick: update.nick.toLowerCase()}
    ]}).exec((err, user) => {

        if(user && user._id != userId) return res.status(200).send({message: 'Los datos ya estan en uso.'});
      
        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
            if(err) return res.status(500).send({message: 'Error en el servidor'});
    
            if(!userUpdated) return res.status(404).send({message: 'Updated faild'});
    
            return res.status(200).send({user: userUpdated});
        });
        

    });
 
}

//subir avatar
function uploadImage(req, res) {
    var userId = req.params.id;

    if(req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var file_extension_split = file_name.split('\.');
        var file_extension =  file_extension_split[1];

        if(userId != req.user.sub) {
           return removeFilesOfuUploads(res, file_path, 'Not Authorization Upload Image')
        }

        if(file_extension == 'png' || file_extension == 'jpeg' || file_extension == 'jpg' || file_extension == 'gif') {
            //update image user
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
                if(err) return res.status(500).send({message: 'Error en el servidor'});

                if(!userUpdated) return res.status(404).send({message: 'Updated Image faild'});
        
                return res.status(200).send({user: userUpdated});
            });
        } else {
           return removeFilesOfuUploads(res, file_path, 'Imagen Extension It Does Not Validate')
        }
        
    } else {
        return res.status(200).send({message: 'Not Load Image'});
    }
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/'+image_file;
   
    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'Not found Image...'});
        }
    });
}

//remove image
function removeFilesOfuUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

//contador
function getCounters(req, res) {
    var userId = req.user.sub;

    if(req.params.id){
      userId = req.params.id;
    } 
    getCountFollow(userId).then((value) => {
        return res.status(200).send({
            following: value.following,
            followed: value.followed,
            publications: value.publications
        });
    });
}

//asicrono follow counts
async function getCountFollow(user_id) {
    try{
        var following = await Follow.count({'user': user_id}).exec()
            .then((count) => {
                return count;
            });

        var followed = await Follow.count({'followed': user_id}).exec()
            .then((count) => {
                return count;
            });

        var publications = await publication.count({'user': user_id}).exec()
            .then((count) => {
                return count;
            });

        return {
            following: following,
            followed: followed,
            publications: publications
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounters
}
