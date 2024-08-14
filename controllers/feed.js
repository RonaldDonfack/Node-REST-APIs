const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("creator");

    if (!posts) {
      const error = new Error("Post not found!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "all post found", posts: posts });
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const newPost = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  try {
    const post = await newPost.save();
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new Error("User not found ");
        error.statusCode = 404;
        throw error;
      }
      creator = user;
      user.posts.push(post);
      const savedUserData = await user.save();
    } catch (error) {
      next(error);
    }
    res.status(201).json({
      message: "Post created successfully!",
      post: newPost,
      creator: {
        _id: creator._id,
        name: creator.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Post not found!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "post found", post: post });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post not found!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("failed to update");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const savePost = await post.save();
    res.status(200).json({ message: "Post updated", post: savePost });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post not found!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("failed to delete");
      error.statusCode = 403;
      throw error;
    }
    // check logged in user
    clearImage(post.imageUrl);
    const upadatedPost = await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    const savedUserData = await user.save();
    res.status(200).json({ message: "Post deleted", post: savedUserData });
  } catch (error) {}
};
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.getStatus = async (req, res, next) => {
  let status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found ");
      error.statusCode = 404;
      throw error;
    }
    status = user.status;
    res.status(200).json({ message: "user status updated", status: status });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found ");
      error.statusCode = 404;
      throw error;
    }
    user.status = req.body.status;
    console.log(user.status);
    const savedUserData = await user.save();
    res.status(201).json({ message: "user status updated" });
  } catch (error) {
    next(error);
  }
  
};
