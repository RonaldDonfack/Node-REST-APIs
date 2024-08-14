const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({createdAt : -1})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!posts) {
      const error = new Error("Post not found!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    });
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

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  try {
    await post.save();
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found ");
      error.statusCode = 404;
      throw error;
    }
    user.posts.push(post);
    await user.save();
    io.getIo().emit("posts", {
      action: "create",
      post: { ...post.doc, creator: { _id: req.userId, name: user.name } },
    });
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: {
        _id: user._id,
        name: user.name,
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
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error("Post not found!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
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
    io.getIo().emit("posts", {
      action: "update",
      post: savePost 
    });
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
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIo().emit("posts", {
      action: "delete",
      post:  postId
    });
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    next(error)
  }
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
    await user.save();
    res.status(201).json({ message: "user status updated" });
  } catch (error) {
    next(error);
  }
};
