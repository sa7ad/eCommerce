const Product = require("../models/productModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
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
    console.log(error.message);
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
    console.log(error.message);
  }
};
const dashboard = async (req, res) => {
  try {
    res.render("adminDashboard");
  } catch {
    console.log(error.message);
  }
};
const loadLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
const usersList = async (req, res) => {
  try {
    const usersList = await User.find({ verified: true });
    res.render("usersList", { users: usersList });
  } catch (error) {
    console.log(error.message);
  }
};

const usersBlocked = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id, "this  is query");
    const usersBlocked = await User.findById({ _id: id });
    if (usersBlocked.blocked === false) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } });
      res.redirect("/admin/usersList");
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } });
      res.redirect("/admin/usersList");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const categories = async (req, res) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    const categoryDetails = await Category.find();
    res.render("categories", { message, category: categoryDetails });
  } catch (error) {
    console.log(error.message);
  }
};
const addCategory = async (req, res) => {
  try {
    const { category_name,category_description } = req.body;
    const categ_name = category_name.toLowerCase()
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
    console.log(error.message);
  }
};
const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findById({_id:id})
    res.render("editCategory", { category,});
  } catch {
    console.log(error.message);
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
    console.log(error.message);
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.query;
    await Category.deleteOne({ _id: id });
    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error.message);
  }
};
const productAddPage = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("productAddPage", { categories });
  } catch (error) {
    console.log(error.message);
  }
};
const productList = async (req, res) => {
  try {
    const product = await Product.find().populate("category");
    res.render("productList", { product });
  } catch (error) {
    console.log(error.message);
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
    const { filename } = req.file;
    const product = new Product({
      name: product_name,
      description: product_description,
      price: product_price,
      quantity: product_quantity,
      category: product_category,
      image: filename,
      stock: true,
    });
    await product.save();
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};
const productDelete = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.deleteOne({ _id: id });
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};
const productEditPage = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById({_id:id})
    const category = await Category.find();
    res.render("productEditPage", { product_id: id, categories: category ,product});
  } catch (error) {
    console.log(error.message);
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
    const { filename } = req.file;
    if (filename) {
      await Product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: product_name,
            price: product_price,
            quantity: product_quantity,
            category: product_category,
            description: product_description,
            image: filename,
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
    console.log(error.message);
  }
};
module.exports = {
  loadLogin,
  loadDashboard,
  dashboard,
  loadLogout,
  usersList,
  usersBlocked,
  categories,
  addCategory,
  editCategory,
  updatedCategory,
  deleteCategory,
  productList,
  productAdd,
  productDelete,
  productAddPage,
  productEditPage,
  productUpdated,
};
