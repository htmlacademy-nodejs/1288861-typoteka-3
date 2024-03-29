'use strict';

const express = require(`express`);
const {HttpCode, API_PREFIX} = require(`../../constants`);
const getRoutes = require(`../api`);
const {getLogger} = require(`../lib/logger`);
const getSequelize = require(`../lib/sequelize`);

const DEFAULT_PORT = 3000;

const logger = getLogger({name: `api`});

const createApp = async () => {
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    logger.debug(`Request on route ${req.url}`);
    res.on(`finish`, () => {
      logger.info(`Response status code ${res.statusCode}`);
    });
    next();
  });

  app.use(API_PREFIX, await getRoutes());

  app.use((req, res) => {
    res.status(HttpCode.NOT_FOUND)
      .send(`Not found`);
    logger.error(`Route not found: ${req.url}`);
  });

  app.use((err, _req, _res, _next) => {
    logger.error(`An error occurred on processing request: ${err.message}`);
  });

  return app;
};

module.exports = {
  name: `--server`,
  async run(args) {
    try {
      logger.info(`Trying to connect to database...`);
      await getSequelize().authenticate();
    } catch (err) {
      logger.error(`An error occurred: ${err.message}`);
      process.exit(1);
    }
    logger.info(`Connection to database established`);

    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || DEFAULT_PORT;
    const app = await createApp();

    app.listen(port)
    .on(`listening`, () => {
      return logger.info(`Listening to connections on ${port}`);
    })
    .on(`error`, (err) => {
      return logger.error(`An error occurred: ${err.message}`);
    });
  }
};
