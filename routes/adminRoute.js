const adminController = require("../controllers/adminController");
const {isAdminLogin} = require("../middleware/adminSession");
const express = require("express");
const adminRoute = express();

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));

adminRoute.set("views", "views/admin");

adminRoute.get("/",adminController.loadLogin);
adminRoute.post("/", adminController.loadDashboard);
adminRoute.get("/dashboard",isAdminLogin, adminController.dashboard);
adminRoute.get("/logout", adminController.loadLogout);
adminRoute.get('/usersList',adminController.usersList)
adminRoute.get('/usersBlocked',adminController.usersBlocked)
adminRoute.post('/usersEdit',adminController.usersUpdated)

module.exports = adminRoute;
