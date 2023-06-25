const User = require("../models/userModel");
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
    const usersList = await User.find({ verified: false });
    res.render("usersList", { value: usersList });
  } catch (error) {
    console.log(error.message);
  }
};

const usersBlocked = async (req, res) => {
  try {
    const id = req.query.id;
    await User.findByIdAndUpdate({_id:id},{$set:{blocked:true}})
    res.redirect("/admin/usersList");
  } catch (error) {
    console.log(error.message);
  }
};

const usersEdit = async (req, res) => {
  try {
    const id = req.query.id;
    res.render("usersEdit", { value: id });
  } catch (error) {
    console.log(error.message);
  }
};
const usersUpdated = async (req, res) => {
  try {
    const { value, first_name, last_name, email, phone_number } = req.body;
console.log(value,'this is  id');
console.log(first_name,'this is first name');
    await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone_number: phone_number,
        },
      }
    );
    res.redirect("/admin/usersList");
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
  usersEdit,
  usersUpdated,
};
