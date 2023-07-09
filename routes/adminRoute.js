const isAdminLogin = require("../middleware/adminSession");
const {
  productEditPage,
  updatedCategory,
  productUpdated,
  productAddPage,
  loadDashboard,
  listProduct,
  editCategory,
  usersBlocked,
  listCategory,
  addCategory,
  productList,
  productAdd,
  categories,
  loadLogout,
  loadLogin,
  usersList,
  dashboard,
  error500,
  orders,
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
adminRoute.get("/usersBlocked", isAdminLogin, usersBlocked);
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
adminRoute.get("/listCategory", isAdminLogin, listCategory);
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
adminRoute.get("/listProduct", isAdminLogin, listProduct);
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
 * /admin/error500:
 *  get:
 *     tags:
 *     - Error
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
adminRoute.get("/error500", error500);

module.exports = adminRoute;
