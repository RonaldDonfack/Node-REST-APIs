const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { clearImage } = require("./utils/file");

const app = express();
const corsOptions = {
  origin: "*", // Replace with your client's origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Authorization", "Content-Type"], // Allow Authorization header
};

app.use(cors(corsOptions));

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

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
    // console.log('the image file path is' , req.file.path);
  }
  return res
    .status(201)
    .json({
      message: "File stored",
      filePath: req.file.path.replace("\\", "/"),
    });
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const message = err.message || "An error occured";
      const code = err.originalError.code;
      const data = err.originalError.data;
      return { message: message, status: code, data: data };
    },
  })
);
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
    app.listen(8080);
  })
  .catch((err) => console.log(err));
