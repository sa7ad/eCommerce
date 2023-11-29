const { isLogout, isLogin } = require("../middleware/userSession");
const {
  validatePaymentVerification,
  orderPlaced,
} = require("../controllers/paymentController");
const {
  orderPlacedSuccess,
  addOrderAddress,
  deleteFromCart,
  removeCoupon,
  applyCoupon,
  placeOrder,
  addToCart,
  cartCount,
  loadCart,
} = require("../controllers/cartController");
const {
  emailVerificationPage,
  deleteFromWishList,
  emailVerification,
  updatedPassword,
  addAddressPage,
  updatedProfile,
  updatedAddress,
  changePassword,
  emailResendOTP,
  manageAddress,
  deleteAddress,
  singleProduct,
  addToWishList,
  subscription,
  loginSuccess,
  loadRegister,
  editProfile,
  editAddress,
  cancelOrder,
  userProfile,
  returnOrder,
  viewOrdered,
  insertUser,
  loadLogout,
  addAddress,
  loadLogin,
  comments,
  loadHome,
  wishList,
  shopPage,
  orders,
} = require("../controllers/userController");
const errorHandler = require("../middleware/errorHandler");
const express = require("express");
const userRoute = express();
userRoute.set("views", "views/users");

/**
 * @swagger
 * /:
 *  get:
 *     tags:
 *     - Home
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/", loadHome);
/**
 * @swagger
 * /singleProduct:
 *  get:
 *     tags:
 *     - Product
 *     description: displays the page of single webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/singleProduct", isLogin, singleProduct);
/**
 * @swagger
 * /login:
 *  get:
 *     tags:
 *     - Login
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/login", isLogout, loadLogin);
/**
 * @swagger
 * /login:
 *  post:
 *     tags:
 *     - Login
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/login", isLogout, loginSuccess);
/**
 * @swagger
 * /register:
 *  get:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/register", isLogout, loadRegister);
/**
 * @swagger
 * /register:
 *  post:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/register", insertUser);
/**
 * @swagger
 * /emailVerification:
 *  get:
 *     tags:
 *     - Register
 *     description: displays the page of email verification
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/emailVerification", isLogout, emailVerificationPage);
/**
 * @swagger
 * /emailVerification:
 *  post:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/emailVerification", emailVerification);
/**
 * @swagger
 * /resendOTP:
 *  post:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/resendOTP", emailResendOTP);

/**
 * @swagger
 * /cart:
 *  get:
 *     tags:
 *     - shop
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/shopPage", shopPage);
/**
 * @swagger
 * /cart:
 *  get:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/cart", isLogin, loadCart);
/**
 * @swagger
 * /cart:
 *  post:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/cart", isLogin, addToCart);
/**
 * @swagger
 * /cart:
 *  put:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.put("/cart", isLogin, deleteFromCart);
/**
 * @swagger
 * /cartCount:
 *  put:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/cartCount", cartCount);
/**
 * @swagger
 * /userProfile:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/userProfile", isLogin, userProfile);
/**
 * @swagger
 * /orders:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/orders", isLogin, orders);
/**
 * @swagger
 * /orders:
 *  put:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.patch("/orders", isLogin, cancelOrder);
/**
 * @swagger
 * /orders:
 *  put:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.patch("/returnOrder", isLogin, returnOrder);
/**
 * @swagger
 * /editProfile:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/viewOrdered", isLogin, viewOrdered);
/**
 * @swagger
 * /editProfile:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/editProfile", isLogin, editProfile);
/**
 * @swagger
 * /manageAddress:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/manageAddress", isLogin, manageAddress);
/**
 * @swagger
 * /addAddress:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/addAddress", isLogin, addAddressPage);
/**
 * @swagger
 * /addAddress:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/addAddress", isLogin, addAddress);
/**
 * @swagger
 * /editAddress:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/editAddress", isLogin, editAddress);
/**
 * @swagger
 * /editAddress:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/editAddress", isLogin, updatedAddress);
/**
 * @swagger
 * /deleteAddress:
 *  put:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.put("/deleteAddress", isLogin, deleteAddress);
/**
 * @swagger
 * /editProfile:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/editProfile", isLogin, updatedProfile);
/**
 * @swagger
 * /changePassword:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/changePassword", isLogin, changePassword);
/**
 * @swagger
 * /changePassword:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/changePassword", isLogin, updatedPassword);
/**
 * @swagger
 * /placeOrder:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/placeOrder", isLogin, placeOrder);
/**
 * @swagger
 * /addAddress:
 *  post:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/addOrderAddress", isLogin, addOrderAddress);
/**
 * @swagger
 * /orderPlaced:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/orderPlaced", isLogin, orderPlacedSuccess);
// /**
//  * @swagger
//  * /placeOrder:
//  *  post:
//  *     tags:
//  *     - Orders
//  *     description: displays the page of login
//  *     responses:
//  *       200:
//  *         description:successful operation
//  */
userRoute.post("/placeOrder", isLogin, orderPlaced);
// /**
//  * @swagger
//  * /api/payment/verify:
//  *  post:
//  *     tags:
//  *     - Orders
//  *     description: displays the page of login
//  *     responses:
//  *       200:
//  *         description:successful operation
//  */
userRoute.post("/verifyPayment", isLogin, validatePaymentVerification);
/**
 * @swagger
 * /placeOrder:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/viewOrdered", isLogin, viewOrdered);
/**
 * @swagger
 * /placeOrder:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/wishList", isLogin, wishList);
/**
 * @swagger
 * /addToWishList:
 *  post:
 *     tags:
 *     - Wishlist
 *     description: displays the page of wishlist
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/addToWishList", isLogin, addToWishList);
/**
 * @swagger
 * /deleteFromWishList:
 *  put:
 *     tags:
 *     - Wishlist
 *     description: displays the page of wishlist
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.put("/deleteFromWishList", isLogin, deleteFromWishList);

/**
 * @swagger
 * /logout:
 *  get:
 *     tags:
 *     - Logout
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/logout", isLogin, loadLogout);
/**
 * @swagger
 * /coupon:
 *  post:
 *     tags:
 *     - apply Coupon
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/coupon", isLogin, applyCoupon);
/**
 * @swagger
 * /removeCoupon:
 *  post:
 *     tags:
 *     - removeCoupon
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/removeCoupon", isLogin, removeCoupon);
/**
 * @swagger
 * /subscription:
 *  post:
 *     tags:
 *     - subscription
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/subscription", subscription);
/**
 * @swagger
 * /comments:
 *  post:
 *     tags:
 *     - comments
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/comments", comments);

userRoute.use(errorHandler);

module.exports = userRoute;
