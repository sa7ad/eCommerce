const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const e = require("express");
require("dotenv").config();

const credentials = {
  adminemail: process.env.ADMIN_EMAIL,
  adminpassword: process.env.ADMIN_PASSWORD,
};

const loadLogin = async (req, res) => {
  try {
    let { message } = req.session;
    if (req.session.adminSession) {
      res.locals.session = req.session.adminSession;
      res.redirect("/admin/dashboard");
    } else {
      req.session.message = "";
      res.render("adminLogin", { message });
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const loadDashboard = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { adminemail, adminpassword } = credentials;
    if (adminemail === email && adminpassword === password) {
      req.session.adminSession = adminemail;
      res.redirect("/admin/dashboard");
    } else {
      req.session.message = "Invalid Admin Details";
      res.redirect("/admin");
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const dashboard = async (req, res) => {
  try {
    res.render("adminDashboard");
  } catch {
    res.redirect("/error500");
  }
};
const loadLogout = async (req, res) => {
  try {
    req.session.adminSession = null;
    res.redirect("/admin");
  } catch (error) {
    res.redirect("/error500");
  }
};
const usersList = async (req, res) => {
  try {
    const usersList = await User.find({ verified: true });
    res.render("usersList", { users: usersList });
  } catch (error) {
    res.redirect("/error500");
  }
};
const usersBlocked = async (req, res) => {
  try {
    const { id } = req.query;
    const usersBlocked = await User.findById({ _id: id });
    if (usersBlocked.blocked === false) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } });
      res.redirect("/admin/usersList");
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } });
      res.redirect("/admin/usersList");
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const categories = async (req, res) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    const categoryDetails = await Category.find();
    res.render("categories", { message, category: categoryDetails });
  } catch (error) {
    res.redirect("/error500");
  }
};
const addCategory = async (req, res) => {
  try {
    const { category_name, category_description } = req.body;
    const categ_name = category_name.toLowerCase();
    const existingCategory = await Category.findOne({ name: categ_name });
    if (!existingCategory) {
      const categ = new Category({
        name: categ_name,
        description: category_description,
      });
      await categ.save();
      res.redirect("/admin/categories");
    } else {
      req.session.message = "This category is already defined";
      res.redirect("/admin/categories");
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const editCategory = async (req, res) => {
  try {
    const { id } = req.query;
    const category = await Category.findById({ _id: id });
    res.render("editCategory", { category });
  } catch {
    res.redirect("/error500");
  }
};
const updatedCategory = async (req, res) => {
  try {
    const { id, category_name, category_description } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { name: category_name, description: category_description } }
    );
    await updatedCategory.save();
    res.redirect("/admin/categories");
  } catch (error) {
    res.redirect("/error500");
  }
};
const listCategory = async (req, res) => {
  try {
    const { id } = req.query;
    const category = await Category.findById({ _id: id });
    if (category.list === true) {
      await Category.updateOne({ _id: id }, { $set: { list: false } });
      res.redirect("/admin/categories");
    } else {
      await Category.updateOne({ _id: id }, { $set: { list: true } });
      res.redirect("/admin/categories");
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const productAddPage = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("productAddPage", { categories });
  } catch (error) {
    res.redirect("/error500");
  }
};
const productList = async (req, res) => {
  try {
    const product = await Product.find().populate("category");
    res.render("productList", { product });
  } catch (error) {
    res.redirect("/error500");
  }
};
const productAdd = async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      product_price,
      product_quantity,
      product_category,
    } = req.body;
    const imageArr = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imageArr.push(req.files[i].filename);
      }
    }
    const product = new Product({
      name: product_name,
      description: product_description,
      price: product_price,
      quantity: product_quantity,
      category: product_category,
      image: imageArr,
      stock: true,
    });
    await product.save();
    res.redirect("/admin/productList");
  } catch (error) {
    res.redirect("/error500");
  }
};
const listProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById({ _id: id });
    if (product.list === true) {
      await Product.updateOne({ _id: id }, { $set: { list: false } });
      res.redirect("/admin/productList");
    } else {
      await Product.updateOne({ _id: id }, { $set: { list: true } });
      res.redirect("/admin/productList");
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const productEditPage = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById({ _id: id });
    const category = await Category.find();
    res.render("productEditPage", {
      product_id: id,
      categories: category,
      product,
    });
  } catch (error) {
    res.redirect("/error500");
  }
};
const productUpdated = async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      product_quantity,
      product_price,
      product_category,
      product_description,
    } = req.body;
    const imageArr = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imageArr.push(req.files[i].filename);
      }
    }
    if (req.files) {
      await Product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: product_name,
            price: product_price,
            quantity: product_quantity,
            category: product_category,
            description: product_description,
            image: imageArr,
          },
        }
      );
      res.redirect("/admin/productList");
    } else {
      await Product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: product_name,
            quantity: product_quantity,
            price: product_price,
            description: product_description,
            category: product_category,
          },
        }
      );
      res.redirect("/admin/productList");
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const orders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.render("ordersList", { orders: orders });
  } catch (error) {
    res.redirect("/error500");
  }
};
const changeStatus = async (req,res) =>{
  try {
    const {status,orderId} = req.body
    await Order.updateOne({_id:orderId},{$set:{orderStatus:status}})
    res.status(201).json({success:true})
  } catch (error) {
    console.log(error.message);
  }
}
const cancelOrder = async (req, res) => {
  try {
    const {orderId,status} = req.body
    const order = await Order.updateOne({_id:orderId},{$set:{orderStatus:status}})
    if(order){
      const orders = await Order.findById({ _id: orderId });
      for (let order of orders.items) {
        await Product.updateOne(
          { _id: order.product },
          { $inc: { quantity: order.quantity } }
        );
      }
      res.status(201).json({message:"Succefull and modified"})
    }else{
      res.status(400).json({message:"Seems like there is an error"})
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const error500 = async (req, res) => {
  try {
    res.render("error500");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  productEditPage,
  updatedCategory,
  productAddPage,
  productUpdated,
  loadDashboard,
  editCategory,
  listCategory,
  changeStatus,
  usersBlocked,
  productList,
  addCategory,
  cancelOrder,
  listProduct,
  loadLogout,
  productAdd,
  categories,
  loadLogin,
  dashboard,
  usersList,
  error500,
  orders,
};
