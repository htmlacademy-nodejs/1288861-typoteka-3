"use strict";

const defineModels = require(`../models`);
const Aliases = require(`../models/aliases`);

module.exports = async (sequelize, {categories, posts, users}) => {
  const {Category, Post, User} = defineModels(sequelize);
  await sequelize.sync({force: true});

  const categoryModels = await Category.bulkCreate(
      categories.map((item) => ({name: item}))
  );

  const categoryIdByName = categoryModels.reduce((acc, next) => ({
    [next.name]: next.id,
    ...acc
  }), {});

  const userModels = await User.bulkCreate(users, {include: [Aliases.POSTS, Aliases.COMMENTS]});

  const userIdByEmail = userModels.reduce((acc, next) => ({
    [next.email]: next.id,
    ...acc
  }), {});

  posts.forEach((post) => {
    post.userId = userIdByEmail[post.user];
    post.comments.forEach((comment) => {
      comment.userId = userIdByEmail[comment.user];
    });
  });


  const postPromises = posts.map(async (post) => {
    const postModel = await Post.create(post, {include: [Aliases.COMMENTS]});
    await postModel.addCategories(
        post.categories.map(
            (name) => categoryIdByName[name]
        )
    );
  });
  await Promise.all(postPromises);
};
