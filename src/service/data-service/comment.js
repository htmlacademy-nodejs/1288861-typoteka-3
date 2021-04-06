'use strict';

const {nanoid} = require(`nanoid`);
const {MAX_ID_LENGTH} = require(`../../constants`);

class CommentService {
  create(post, comment) {
    const newComment = Object.assign({
      id: nanoid(MAX_ID_LENGTH),
    }, comment);

    post.comments.push(newComment);
    return comment;
  }

  drop(post, commentId) {
    const dropComment = post.comments
      .find((item) => item.id === commentId);

    if (!dropComment) {
      return null;
    }

    post.comments = post.comments
      .filter((item) => item.id !== commentId);

    return dropComment;
  }

  findAll(post) {
    return post.comments;
  }

}

module.exports = CommentService;
