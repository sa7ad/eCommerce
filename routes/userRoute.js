const User = require("../models/userModel");
const {isLogout,isLogin} = require("../middleware/userSession");
const userController = require("../controllers/userController");

const express = require("express");
const userRoute = express();

userRoute.set('views','views/users')


userRoute.get("/", userController.loadHome);

userRoute.get("/login", isLogout, userController.loadLogin);
userRoute.post("/login", isLogout, userController.loginSuccess);

userRoute.get("/register", userController.loadRegister);
userRoute.post("/register", userController.insertUser);

userRoute.post("/emailVerification", userController.emailVerification);

userRoute.get("/logout", isLogin, userController.loadLogout);

module.exports = userRoute;
