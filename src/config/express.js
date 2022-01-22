const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const routes = require("../routes");
const errorHandler = require("../middlewares/error");

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// enable cors
app.use(cors());
app.options("*", cors());

// routes
app.get("/ping", (req, res) => {
  res.sendStatus(200);
});

app.use("/users", routes.userRoutes);
app.use("/posts", routes.postRoutes);
app.use("/login", routes.loginRoutes);

app.all("*", (req, res) => {
  res.sendStatus(404);
});

// error handler
app.use(errorHandler);

module.exports = app;
