const isAdminLogin = require("../middleware/adminSession");
const {
  productEditPage,
  updatedCategory,
  productUpdated,
  deleteCategory,
  productAddPage,
  loadDashboard,
  productDelete,
  editCategory,
  usersBlocked,
  addCategory,
  productList,
  productAdd,
  categories,
  loadLogout,
  loadLogin,
  usersList,
  dashboard,
  orders,
} = require("../controllers/adminController");
const upload = require("../middleware/uploadImage");
const express = require("express");
const adminRoute = express();
adminRoute.set("views", "views/admin");

adminRoute.get("/", loadLogin);
adminRoute.post("/", loadDashboard);
adminRoute.get("/dashboard", isAdminLogin, dashboard);
adminRoute.get("/logout", loadLogout);
adminRoute.get("/usersList", isAdminLogin, usersList);
adminRoute.get("/usersBlocked", isAdminLogin, usersBlocked);
adminRoute.get("/categories", isAdminLogin, categories);
adminRoute.post("/categories", isAdminLogin, addCategory);
adminRoute.get("/editCategory", isAdminLogin, editCategory);
adminRoute.post("/editCategory", isAdminLogin, updatedCategory);
adminRoute.get("/deleteCategory", isAdminLogin, deleteCategory);
adminRoute.get("/productList", isAdminLogin, productList);
adminRoute.get("/productEditPage", isAdminLogin, productEditPage);
adminRoute.post(
  "/productEditPage",
  isAdminLogin,
  upload.array("product_img", 4),
  productUpdated
);
adminRoute.get("/productAddPage", isAdminLogin, productAddPage);
adminRoute.get("/productDelete", isAdminLogin, productDelete);
adminRoute.post(
  "/productAddPage",
  isAdminLogin,
  upload.array("product_img", 4),
  productAdd
);
adminRoute.get("/orders", isAdminLogin, orders);

module.exports = adminRoute;
