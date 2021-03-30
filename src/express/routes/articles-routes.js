'use strict';

const {Router} = require(`express`);
const articlesRouter = new Router();

articlesRouter.get(`/category/:id`, (req, res) => res.render(`articles-by-category`));
articlesRouter.get(`/add`, (req, res) => res.render(`post/new-post`));
articlesRouter.get(`/edit/:id`, (req, res) => res.render(`post/edit-post`));
articlesRouter.get(`/:id`, (req, res) => res.render(`post`));

module.exports = articlesRouter;
