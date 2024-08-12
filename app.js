const path = require("path");

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
app.use("/images", exprese.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);

mongoose
  .connect("mongodb://localhost:27017/messages")
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
