const { isLogout, isLogin } = require("../middleware/userSession");
const {
  loadCart,
  addToCart,
  deleteFromCart,
  cartCount,
} = require("../controllers/cartController");
const {
  loadHome,
  singleProduct,
  loadLogin,
  loginSuccess,
  loadRegister,
  insertUser,
  emailVerification,
  loadLogout,
} = require("../controllers/userController");

const express = require("express");
const userRoute = express();

userRoute.set("views", "views/users");

userRoute.get("/", loadHome);
userRoute.get("/singleProduct", isLogin, singleProduct);

userRoute.get("/login", isLogout, loadLogin);
userRoute.post("/login", isLogout, loginSuccess);

userRoute.get("/register", loadRegister);
userRoute.post("/register", insertUser);

userRoute.post("/emailVerification", emailVerification);

userRoute.get("/cart", isLogin, loadCart);
userRoute.post("/cart", addToCart);

userRoute.put("/cart", deleteFromCart);
userRoute.post("/cartCount", cartCount);

userRoute.get("/logout", isLogin, loadLogout);

module.exports = userRoute;
