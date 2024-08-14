const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "*", // Replace with your client's origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Authorization", "Content-Type"], // Allow Authorization header
};

app.use(cors(corsOptions));
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
// const { Result } = require("express-validator");

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
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  let message = error.message;
  let status = error.statusCode || 500;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect("mongodb://localhost:27017/messages")
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected!");
    });
  })
  .catch((err) => console.log(err));
