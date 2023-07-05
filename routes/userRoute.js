const { isLogout, isLogin } = require("../middleware/userSession");
const {
  deleteFromCart,
  orderPlaced,
  placeOrder,
  addToCart,
  cartCount,
  loadCart,
} = require("../controllers/cartController");
const {
  emailVerification,
  addAddressPage,
  updatedProfile,
  updatedAddress,
  manageAddress,
  deleteAddress,
  singleProduct,
  loginSuccess,
  loadRegister,
  editProfile,
  editAddress,
  userProfile,
  insertUser,
  loadLogout,
  addAddress,
  loadLogin,
  error404,
  loadHome,
  orders,
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
userRoute.get("/userProfile", isLogin, userProfile);
userRoute.get("/orders", isLogin, orders);
userRoute.get("/editProfile", isLogin, editProfile);
userRoute.get("/manageAddress", isLogin, manageAddress);
userRoute.get("/addAddress", isLogin, addAddressPage);
userRoute.post("/addAddress", isLogin, addAddress);
userRoute.get("/editAddress", isLogin, editAddress);
userRoute.post("/editAddress", isLogin, updatedAddress);
userRoute.put("/deleteAddress", isLogin, deleteAddress);
userRoute.post("/editProfile", isLogin, updatedProfile);
userRoute.get("/placeOrder", isLogin, placeOrder);
userRoute.get("/orderPlaced", isLogin, orderPlaced);
userRoute.get("/logout", isLogin, loadLogout);
userRoute.get("/error404", error404);

module.exports = userRoute;
