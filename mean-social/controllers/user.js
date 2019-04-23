'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt  = require('../services/jwt');

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
                    return res.status(404).send({message: 'Usuario/Clave no validas'});
                }
            });
        } else {
            return res.status(404).send({message: 'Usuario/Clave no validas!!!'});
        }
    })
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser
}
