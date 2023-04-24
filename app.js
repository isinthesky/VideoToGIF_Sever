const express = require("express");
const routerLoader = require("./src/loader/routers");
const expressLoader = require("./src/loader/express");
const errorHandlerLoader = require("./src/loader/errorHandler");

const app = express();

expressLoader(app);
routerLoader(app);
errorHandlerLoader(app);

module.exports = app;
