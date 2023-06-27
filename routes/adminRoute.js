const isAdminLogin = require("../middleware/adminSession");
const {
  loadLogin,
  loadDashboard,
  loadLogout,
  usersList,
  usersBlocked,
  categories,
  addCategory,
  editCategory,
  updatedCategory,
  deleteCategory,
  productList,
  productEditPage,
  dashboard,
  productUpdated,
  productAdd,
  productAddPage,
  productDelete,
} = require("../controllers/adminController");
const upload = require("../middleware/upload-middleware");
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
  upload.single("product_img"),
  productUpdated
);
adminRoute.get("/productAddPage", isAdminLogin, productAddPage);
adminRoute.get("/productDelete", isAdminLogin, productDelete);
adminRoute.post(
  "/productAddPage",
  isAdminLogin,
  upload.single("product_img"),
  productAdd
);

module.exports = adminRoute;
