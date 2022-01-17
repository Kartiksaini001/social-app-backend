const { app, emailApp, mediaApp, mongoose, vars } = require("./config");

// open mongoose connection
mongoose.connect();

// listen to requests (main server)
app.listen(vars.port, () =>
  console.log(`Server started on port ${vars.port} (${vars.env})`)
);

// start media server
mediaApp.listen(vars.mediaPort, () =>
  console.log(`Media Server started on port ${vars.mediaPort} (${vars.env})`)
);

// start email server
emailApp.listen(vars.emailConfig.port, () =>
  console.log(`Mailing Server started on port ${vars.emailConfig.port} (${vars.env})`)
);

// Handle unexpected errors
process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
    process.exit(1);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });
