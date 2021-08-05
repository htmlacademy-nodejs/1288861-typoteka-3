'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const postValidator = require(`../middle-wares/post-validator`);
const postExist = require(`../middle-wares/post-exists`);
const commentValidator = require(`../middle-wares/comment-validator`);

module.exports = (app, postService, commentService) => {
  const route = new Router();
  app.use(`/articles`, route);

  route.get(`/`, async (req, res) => {
    const {offset, limit, comments} = req.query;
    let result;
    if (limit || offset) {
      result = await postService.findPage({limit, offset});
    } else {
      result = await postService.findAll(comments);
    }
    res.status(HttpCode.OK).json(result);
  });

  route.get(`/:postId`, async (req, res) => {
    const {postId} = req.params;
    const {comments} = req.query;
    const post = await postService.findOne(postId, comments);

    if (!post) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found with ${postId}`);
    }

    return res.status(HttpCode.OK)
      .json(post);
  });

  route.post(`/`, postValidator, async (req, res) => {
    const post = await postService.create(req.body);

    return res.status(HttpCode.CREATED)
      .json(post);
  });

  route.put(`/:postId`, postValidator, async (req, res) => {
    const {postId} = req.params;

    const updated = await postService.update(postId, req.body);

    if (!updated) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found with ${postId}`);
    }
    return res.status(HttpCode.OK)
      .send(`Updated`);
  });

  route.delete(`/:postId`, async (req, res) => {
    const {postId} = req.params;
    const post = await postService.drop(postId);

    if (!post) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    return res.status(HttpCode.OK)
      .json(post);
  });

  route.get(`/:postId/comments`, postExist(postService), async (req, res) => {
    const {postId} = req.params;
    const comments = await commentService.findAll(postId);

    res.status(HttpCode.OK)
      .json(comments);

  });

  route.delete(`/:postId/comments/:commentId`, postExist(postService), async (req, res) => {
    const {commentId} = req.params;
    const deleted = await commentService.drop(commentId);

    if (!deleted) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    return res.status(HttpCode.OK)
      .json(deleted);
  });

  route.post(`/:postId/comments`, [postExist(postService), commentValidator], (req, res) => {
    const {post} = res.locals;
    const comment = commentService.create(post, req.body);

    return res.status(HttpCode.CREATED)
      .json(comment);
  });
};
