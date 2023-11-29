const isAdminLogin = require("../middleware/adminSession");
const {
  productEditPage,
  updatedCategory,
  productUpdated,
  productAddPage,
  bannerUpdated,
  loadDashboard,
  updatedCoupon,
  editCategory,
  usersBlocked,
  listCategory,
  changeStatus,
  addCategory,
  viewOrdered,
  listProduct,
  salesReport,
  cancelOrder,
  productList,
  couponAdded,
  bannerAdded,
  productAdd,
  categories,
  editCoupon,
  listBanner,
  loadLogout,
  datePicker,
  bannerAdd,
  bannerEdit,
  loadLogin,
  usersList,
  dashboard,
  coupon,
  banner,
  orders,
  listCoupon,
} = require("../controllers/adminController");
const upload = require("../middleware/uploadImage");
const express = require("express");
const adminRoute = express();
adminRoute.set("views", "views/admin");

/**
 * @swagger
 * /admin:
 *  get:
 *     tags:
 *     - Login
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/", loadLogin);
/**
 * @swagger
 * /admin:
 *  post:
 *     tags:
 *     - Login
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post("/", loadDashboard);
/**
 * @swagger
 * /admin/dashboard:
 *  get:
 *     tags:
 *     - Dashboard
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/dashboard", isAdminLogin, dashboard);
/**
 * @swagger
 * /admin/logout:
 *  get:
 *     tags:
 *     - Logout
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/logout", loadLogout);
/**
 * @swagger
 * /admin/usersList:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/usersList", isAdminLogin, usersList);
/**
 * @swagger
 * /admin/usersBlocked:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/usersBlocked", isAdminLogin, usersBlocked);
/**
 * @swagger
 * /admin/categories:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/categories", isAdminLogin, categories);
/**
 * @swagger
 * /admin/categories:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post("/categories", isAdminLogin, addCategory);
/**
 * @swagger
 * /admin/editCategory:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/editCategory", isAdminLogin, editCategory);
/**
 * @swagger
 * /admin/editCategory:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post("/editCategory", isAdminLogin, updatedCategory);
/**
 * @swagger
 * /admin/deleteCategory:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/listCategory", isAdminLogin, listCategory);
/**
 * @swagger
 * admin/productList:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/productList", isAdminLogin, productList);
/**
 * @swagger
 * /admin/productEditPage:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/productEditPage", isAdminLogin, productEditPage);
/**
 * @swagger
 * /admin/productEditPage:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post(
  "/productEditPage",
  isAdminLogin,
  upload.array("product_img", 4),
  productUpdated
);
/**
 * @swagger
 * /admin/productAddPage:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/productAddPage", isAdminLogin, productAddPage);
/**
 * @swagger
 * /admin/productDelete:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/listProduct", isAdminLogin, listProduct);
/**
 * @swagger
 * /admin/productAddPage:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post(
  "/productAddPage",
  isAdminLogin,
  upload.array("product_img", 4),
  productAdd
);
/**
 * @swagger
 * /admin/orders:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/orders", isAdminLogin, orders);
/**
 * @swagger
 * /admin/banner:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/banner", isAdminLogin, banner);
/**
 * @swagger
 * /admin/bannerAdd:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/bannerAdd", isAdminLogin, bannerAdd);
/**
 * @swagger
 * /admin/bannerAdd:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post(
  "/bannerAdd",
  isAdminLogin,
  upload.array("bannerImage", 4),
  bannerAdded
);
/**
 * @swagger
 * /admin/bannerEdit:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/bannerEdit", isAdminLogin, bannerEdit);
/**
 * @swagger
 * /admin/bannerEdit:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post(
  "/bannerEdit",
  isAdminLogin,
  upload.array("bannerImage", 4),
  bannerUpdated
);
/**
 * @swagger
 * /admin/listBanner:
 *  patch:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/listBanner", isAdminLogin, listBanner);
/**
 * @swagger
 * /admin/orders:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/orders", isAdminLogin, cancelOrder);
/**
 * @swagger
 * /admin/orders:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/viewOrdered", isAdminLogin, viewOrdered);
/**
 * @swagger
 * /admin/adminSalesReport:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/changeStatus", isAdminLogin, changeStatus);
/**
 * @swagger
 * /admin/salesReport:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/salesReport", isAdminLogin, salesReport);
/**
 * @swagger
 * /admin/salesReport:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post("/salesReport", isAdminLogin, datePicker);
/**
 * @swagger
 * /admin/coupon:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/coupon", isAdminLogin, coupon);
/**
 * @swagger
 * /admin/coupon:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post("/coupon", isAdminLogin, couponAdded);
/**
 * @swagger
 * /admin/coupon:
 *  get:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/editCoupon", isAdminLogin, editCoupon);
/**
 * @swagger
 * /admin/coupon:
 *  post:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.post("/editCoupon", isAdminLogin, updatedCoupon);
/**
 * @swagger
 * /admin/listCoupon:
 *  patch:
 *     tags:
 *     - Admin
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.patch("/listCoupon", isAdminLogin, listCoupon);


module.exports = adminRoute;
