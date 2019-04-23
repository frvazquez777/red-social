'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({
    text:       String,
    create_at:  String,
    emitter:    { type: ObjectId, ref: 'User' },
    receiver:   { type: ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Message', MessageSchema);