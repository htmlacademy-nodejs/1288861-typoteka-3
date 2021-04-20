'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const postValidator = require(`../middle-wares/post-validator`);
const postExist = require(`../middle-wares/post-exists`);
const commentValidator = require(`../middle-wares/comment-validator`);

module.exports = (app, postService, commentService) => {
  const route = new Router();
  app.use(`/articles`, route);

  route.get(`/`, (req, res) => {
    const posts = postService.findAll();
    res.status(HttpCode.OK).json(posts);
  });

  route.get(`/:postId`, (req, res) => {
    const {postId} = req.params;
    const post = postService.findOne(postId);

    if (!post) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found with ${postId}`);
    }

    return res.status(HttpCode.OK)
      .json(post);
  });

  route.post(`/`, postValidator, (req, res) => {
    const post = postService.create(req.body);

    return res.status(HttpCode.CREATED)
      .json(post);
  });

  route.put(`/:postId`, postValidator, (req, res) => {
    const {postId} = req.params;
    const existPost = postService.findOne(postId);

    if (!existPost) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found with ${postId}`);
    }

    const updatedOffer = postService.update(postId, req.body);

    return res.status(HttpCode.OK)
      .json(updatedOffer);
  });

  route.delete(`/:postId`, (req, res) => {
    const {postId} = req.params;
    const post = postService.drop(postId);

    if (!post) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    return res.status(HttpCode.OK)
      .json(post);
  });

  route.get(`/:postId/comments`, postExist(postService), (req, res) => {
    const {post} = res.locals;
    const comments = commentService.findAll(post);

    res.status(HttpCode.OK)
      .json(comments);

  });

  route.delete(`/:postId/comments/:commentId`, postExist(postService), (req, res) => {
    const {post} = res.locals;
    const {commentId} = req.params;
    const deletedComment = commentService.drop(post, commentId);

    if (!deletedComment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    return res.status(HttpCode.OK)
      .json(deletedComment);
  });

  route.post(`/:postId/comments`, [postExist(postService), commentValidator], (req, res) => {
    const {post} = res.locals;
    const comment = commentService.create(post, req.body);

    return res.status(HttpCode.CREATED)
      .json(comment);
  });
};
