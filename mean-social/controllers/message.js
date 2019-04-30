'use strict'

//librarys
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

//models
var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function test(req, res) {
    return res.status(200).send({message: 'Hello Message test'});
}

function saveMessage(req, res) {
    var params = req.body;
    var userId = req.user.sub;
    console.log(params);
    if(!params.text && !params.receiver) return res.status(200).send({message: 'Needed Information'})

    var message = new  Message();
    message.emitter = userId;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = false;

    console.log(message);
    message.save((err, messageStore) => {
        if(err) return res.status(500).send({message: 'Error Services Message'});

        if(!messageStore) return res.status(404).send({message: 'Error Send Message'});

        return res.status(200).send({message: messageStore});
    });
}

function getReceiveMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;

    if(req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;

    Message.find({receiver: userId}).populate('emitter', 'name surname nick image').paginate(page, itemsPerPage, (err, message, total) => {
        if(err) return res.status(500).send({message: 'Error Services Message'});

        if(!message) return res.status(404).send({message: 'Not Found Message'});

        // message.forEach(msg => {
        //     msg.emitter.password =undefined;
        // });
        return res.status(200).send({
            total,
            pages: Math.ceil(total/itemsPerPage),
            page: page,
            message: message
        });
    });
}

function getEmmitMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;

    if(req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;

    Message.find({emitter: userId}).populate('emitter receiver', 'name surname nick image').paginate(page, itemsPerPage, (err, message, total) => {
        if(err) return res.status(500).send({message: 'Error Services Message'});

        if(!message) return res.status(404).send({message: 'Not Found Message'});
        return res.status(200).send({
            total,
            pages: Math.ceil(total/itemsPerPage),
            page: page,
            message: message
        });
    });
}

function getUnviewedMessages(req, res) {
    var userId = req.user.sub;
    try {
        Message.count({receiver: userId, viewed: 'false'}).exec()
        .then(count => {
            return res.status(200).send({
                unviewed: count
            });
        });
    } catch (e) {
        return res.status(500).send({message: 'Error del servidor'});
    }

} 

function setViewedMessages(req, res) {
    var userId = req.user.sub;

    Message.update({receiver: userId, viewed: false}, {viewed: 'true'}, {'multi': true}, (err, messageUpdate) => {
        if(err) return res.status(500).send({message: 'Error del servidor'});

        return res.status(200).send({
            message: messageUpdate
        });
    });
}

module.exports = {
    test,
    saveMessage,
    getReceiveMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
}