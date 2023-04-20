const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");
const videoRouter = require("../routes/video");

const routerLoader = (app) => {
  app.use("/", indexRouter);
  app.use("/users", usersRouter);
  app.use("/video", videoRouter);
};

module.exports = routerLoader;
