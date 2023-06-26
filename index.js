const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/eCommerce");

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

const nocache = require("nocache");
const session = require("express-session");
const logger = require("morgan");
const express = require("express");
const app = express();
app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/userAssets"));
app.use(express.static(__dirname + "/public/adminAssets"));
app.use(nocache());
app.use(
  session({
    secret: "key",
    saveUninitialized: true,
    resave: false,
  })
);

const PORT = 3000;

//User Routes
app.use("/", userRoute);
//Admin Routes
app.use("/admin", adminRoute);

app.listen(PORT, () => {
  console.log("Server is running on PORT http://localhost:3000");
});
