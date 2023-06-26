const adminController = require("../controllers/adminController");
const {isAdminLogin} = require("../middleware/adminSession");
const upload = require('../middleware/upload-middleware')

const express = require("express");
const adminRoute = express();

adminRoute.set('views','views/admin')

adminRoute.get("/",adminController.loadLogin);
adminRoute.post("/", adminController.loadDashboard);
adminRoute.get("/dashboard",isAdminLogin, adminController.dashboard);
adminRoute.get("/logout", adminController.loadLogout);
adminRoute.get('/usersList',adminController.usersList)
adminRoute.get('/usersBlocked',adminController.usersBlocked)
adminRoute.get('/categories',adminController.categories)
adminRoute.post('/categories',adminController.addCategory)
adminRoute.get('/editCategory',adminController.editCategory)
adminRoute.post('/editCategory',adminController.updatedCategory)
adminRoute.get('/deleteCategory',adminController.deleteCategory)
adminRoute.get('/productList',adminController.productList)
adminRoute.get('/productEditPage',adminController.productEditPage)
adminRoute.post('/productEditPage',upload.array('product_img',2),adminController.productUpdated)
adminRoute.get('/productAddPage',adminController.productAddPage)
adminRoute.get('/productDelete',adminController.productDelete)
adminRoute.post('/productAddPage',upload.array('product_img',2),adminController.productAdd)

module.exports = adminRoute;
