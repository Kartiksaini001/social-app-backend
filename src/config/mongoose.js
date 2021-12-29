const mongoose = require("mongoose");
const { mongo } = require("./vars");

// Exit application on error
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

module.exports.connect = () => {
  mongoose.connect(mongo.uri).then(() => console.log("mongoDB connected..."));
  return mongoose.connection;
};
