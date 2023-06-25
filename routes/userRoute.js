const User = require("../models/userModel");
const userSession = require("../middleware/userSession");
const userController = require("../controllers/userController");

const express = require("express");
const userRoute = express();

userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.set("views", "views/users");

userRoute.get("/", userController.loadHome);

userRoute.get("/login", userSession.isLogout, userController.loadLogin);
userRoute.post("/login", userSession.isLogout, userController.loginSuccess);

userRoute.get("/register", userController.loadRegister);
userRoute.post("/register", userController.insertUser);

userRoute.post("/emailVerification", userController.emailVerification);

userRoute.get("/logout", userSession.isLogin, userController.loadLogout);

module.exports = userRoute;
