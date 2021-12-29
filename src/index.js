const { app, mongoose, vars } = require("./config");

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(vars.port, () =>
  console.log(`Server started on port ${vars.port} (${vars.env})`)
);

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
    process.exit(1);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });
