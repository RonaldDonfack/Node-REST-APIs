const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cors = require("cors");
const app = express();

app.use(cors());
const feedRoutes = require("./routes/feed");
const { Result } = require("express-validator");

// app.use(bodyParser.urlencoded()) x-www-form-urlencoded <form> data
app.use(bodyParser.json()); // application/json

// app.use((req, res , next) => {
//     res.setHeader('Access-Controle-Allow-Origin', '*');
//     res.setHeader('Access-Controle-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Controle-Allow-Headers', 'Content-Type , Authorization');
//     res.setHeader("Content-Type", "application/json");

//     next();
// })

app.use("/feed", feedRoutes);

mongoose
  .connect("mongodb://localhost:27017/messages")
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
