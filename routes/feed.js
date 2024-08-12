const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const feedController = require("../controllers/feed");

// GET /feed/posts
router.get("/posts", feedController.getPosts);

// POST /feed/posts
router.post("/post", [
    body('title' , 'the title should be atleast 5 charateres')
    .isLength({min : 5}),
    body('content' , 'the content should be atleast 5 charateres')
    .isLength({min : 5})
], feedController.createPost);

module.exports = router;
