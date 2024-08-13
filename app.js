const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const cors = require("cors");
const app = express();

app.use(cors());
const feedRoutes = require("./routes/feed");
const { Result } = require("express-validator");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // Accept the file
  } else {
      cb(null, false); // Reject the file
  }
};

// app.use(bodyParser.urlencoded()) x-www-form-urlencoded <form> data
app.use(bodyParser.json()); // application/json
app.use(multer({storage : fileStorage , fileFilter : fileFilter }).single('image'));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  let message = error.message;
  let status = error.statusCode || 500;
  res.status(status).json({
    message: message,
  });
});

mongoose
  .connect("mongodb://localhost:27017/messages")
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
