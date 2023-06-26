const Product = require("../models/productModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
require("dotenv").config();

const credentials = {
  email: process.env.adminEmail,
  password: process.env.adminPassword,
};
const loadLogin = async (req, res) => {
  try {
    if (req.session.adminSession) {
      res.locals.session = req.session.adminSession;
      res.redirect("/admin/dashboard");
    } else {
      res.render("adminLogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadDashboard = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (credentials.email === email && credentials.password === password) {
      req.session.adminSession = credentials.email;
      res.redirect("/admin/dashboard");
    } else {
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
    res.render("usersList", { value: usersList });
  } catch (error) {
    console.log(error.message);
  }
};

const usersBlocked = async (req, res) => {
  try {
    const {id} = req.query;
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
    let {message} = req.session
    req.session.message=''
    const categoryDetails = await Category.find({})
    res.render("categories",{message,category:categoryDetails});
  } catch (error) {
    console.log(error.message);
  }
};
const addCategory = async (req, res) => {
  try {
    const { category_name, category_description } = req.body;
    const existingCategory = await Category.findOne({name:category_name})
    if(!existingCategory ){
      const category = new Category({
        name: category_name,
        description: category_description,
      });
      await category.save();
      res.redirect('/admin/categories')
    }else{
      req.session.message='This category is already defined'
      res.redirect('/admin/categories')
    }
    
  } catch (error) {
    console.log(error.message);
  }
};
const editCategory = async (req,res)=>{
  try{
    const id = req.query.id
    res.render('editCategory',{id:id})
  }catch{
    console.log(error.message);
  }
}
const updatedCategory = async(req,res) =>{
  try {
    const {id,category_name,category_description} =req.body
    const updatedCategory = await Category.findByIdAndUpdate({_id:id},{$set:{name:category_name,description:category_description}})
    await updatedCategory.save()
    res.redirect('/admin/categories')
  } catch (error) {
    console.log(error.message);
  }
}
const deleteCategory = async (req,res) =>{
  try {
    const {id} = req.query
    await Category.deleteOne({_id:id})
    res.redirect('/admin/categories')
  } catch (error) {
    console.log(error.message);
  }
}
const productAddPage = async (req, res) => {
  try {
    const category = await Category.find()
    res.render("productAddPage",{categories : category});
  } catch (error) {
    console.log(error.message);
  }
};
const productList = async (req, res) => {
  try {
    const product = await Product.find({});
    res.render("productList", { product: product });
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
      product_category,
    } = req.body;
    console.log(product_category,product_description,product_name,'this is id');
    const product = new Product({
      name: product_name,
      description: product_description,
      price: product_price,
      category: product_category,
      stock: true,
    });
    const savedProduct=await product.save();
    console.log(savedProduct,'this is saved product');
    res.redirect('/admin/productList')
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
  productAddPage,
};
