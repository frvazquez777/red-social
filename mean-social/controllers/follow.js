'use strict'

//var path = require('path');
//var fs = require('fs');
// var mongoosePaginate = require('mongoose-pagination');

// var User = require('../models/user');
var Follow = require('../models/follow');

function test(req, res) {
    return res.status(200).send({message: 'Hello follow test'});
}

function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if(err) return res.status(500).send({message: ' Error en el Servidor'});

        if(!followStored) return res.status(404).send({message: 'Not Found Follow'});

        return res.status(200).send({follow: followStored});
    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user': userId, 'followed': followId}).remove((err) => {
        if(err) return res.status(500).send({message: ' Error en el Servidor - Not Follow'});

        return res.status(200).send({message: 'User Stop Following'});
    });
}
function getFollowingUsers(req, res) {
    var userId = req.user.sub;

    if(req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    
    if(req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
        if(err) return res.status(500).send({message: 'Error servidor get follows'});

        if(!follows) return res.status(404).send({message: 'Not found follows'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

function getUserFollowed(req, res) {
    var userId = req.user.sub;

    if(req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    
    if(req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({followed: userId}).populate('user followed').paginate(page, itemsPerPage, (err, follows, total) => {
        if(err) return res.status(500).send({message: 'Error servidor get follows'});

        if(!follows) return res.status(404).send({message: 'Not found user followed'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

//get my follows
function getMyFollows(req, res) {
    var userId = req.user.sub;
    var find = Follow.find({user: userId});

    if(req.params.followed){
        find = Follow.find({followed: userId});
    }

    find.populate('user followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error servidor get follows'});

        if(!follows) return res.status(404).send({message: 'Not found user followed'});

        return res.status(200).send({follows});
    });
}



module.exports = {
    test,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getUserFollowed,
    getMyFollows
}