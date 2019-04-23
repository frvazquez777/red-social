'use strict'

//decalraciones
var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;


//contexiones de base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:32768/mean_social', { useNewUrlParser: true })
    .then(() => {
        console.log("La conexion exitosa...");

        //crear servidor
        app.listen(port, () => {
            console.log("servidor iniciado...");
        });

    })
    .catch(err => console.log(err));



