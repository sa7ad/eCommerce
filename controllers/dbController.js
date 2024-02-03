const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.connect(process.env.DB);

  mongoose.connection.on("connected", () => {
    console.log("Connected to database successfully");
  });
  mongoose.connection.on("error", (err) => {
    console.log("Error while connecting to database:" + err);
  });
  mongoose.connection.on("disconnected", (err) => {
    console.log("Mongodb connection disconnected");
  });
};

module.exports = dbConnect;
