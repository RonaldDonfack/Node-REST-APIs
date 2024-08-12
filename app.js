const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors')
const app = express()

app.use(cors())
const feedRoutes = require('./routes/feed');

// app.use(bodyParser.urlencoded()) x-www-form-urlencoded <form> data
app.use(bodyParser.json()) ; // application/json

// app.use((req, res , next) => {
//     res.setHeader('Access-Controle-Allow-Origin', '*');
//     res.setHeader('Access-Controle-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Controle-Allow-Headers', 'Content-Type , Authorization');
//     res.setHeader("Content-Type", "application/json");

//     next();
// })

app.use('/feed' , feedRoutes);

app.listen(8080);