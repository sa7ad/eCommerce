const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const userOTPVerification = require("../models/userOTPVerification");
require("dotenv").config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Cart = require("../models/cartModel");

const loadLogin = async (req, res) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    res.render("userLogin", { message });
  } catch (error) {
    console.log(error.message);
  }
};

const loginSuccess = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const usersData = await User.findOne({ email: email });
    if (usersData) {
      const passwordMatch = await bcrypt.compare(password, usersData.password);
      if (usersData.verified) {
        if (usersData.blocked === false) {
          if (passwordMatch) {
            req.session.userId = usersData._id.toString();
            res.redirect("/");
          } else {
            req.session.message = "Incorrect Password";
            res.redirect("/login");
          }
        } else {
          req.session.message = "Admin has blocked";
          res.redirect("/login");
        }
      } else {
        req.session.message = "User has not been registered";
        res.redirect("/register");
      }
    } else {
      req.session.message = "Invalid Email or Password";
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    res.render("userRegister", { message });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { phone_number: req.body.phone_number }],
    });
    if (existingUser) {
      req.session.message = "User already registered";
      res.redirect("/register");
    } else {
      const password = req.body.password;
      const confirm_password = req.body.confirm_password;
      if (password === confirm_password) {
        const hashPassword = await bcrypt.hash(password, 10);
        const hashConfirmPassword = await bcrypt.hash(confirm_password, 10);
        const user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          phone_number: req.body.phone_number,
          password: hashPassword,
          confirm_password: hashConfirmPassword,
          verified: false,
          blocked: false,
        });
        const userData = await user.save();
        if (userData) {
          let otpVerification = await sendOTPVerificationMail(userData);
          res.render("userEmail", { otp: otpVerification });
        } else {
          req.session.message = "Invalid Verification";
          res.render("userRegister");
        }
      } else {
        req.session.message = "Passwords does not match";
        res.render("userRegister");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const sendOTPVerificationMail = async ({ _id, email }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your email",
      html: `${otp}`,
    };
    const hashedOTP = await bcrypt.hash(otp, 10);
    const newVerificationOTP = new userOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    let verified = await newVerificationOTP.save();
    await transporter.sendMail(mailOptions);
    return verified._id;
  } catch (error) {
    console.log(error.message);
  }
};
const emailVerification = async (req, res) => {
  try {
    let { otp, userVerificationId } = req.body;
    let userId = userVerificationId;
    const UserOTPVerificationRecords = await userOTPVerification.find({
      _id: userId,
    });
    if (!userId || !otp) {
      await User.deleteMany({ _id: UserOTPVerificationRecords[0].userId });
      await userOTPVerification.deleteMany({ _id: userId });
      res.redirect("/register");
    } else {
      if (UserOTPVerificationRecords.length <= 0) {
        res.redirect("/register");
      } else {
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;
        if (expiresAt < Date.now()) {
          await User.deleteMany({ _id: UserOTPVerificationRecords[0].userId });
          await userOTPVerification.deleteMany({ _id: userId });
          req.session.message = "OTP has been expired,Please register again";
          res.redirect("/register");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            await User.deleteMany({
              _id: UserOTPVerificationRecords[0].userId,
            });
            await userOTPVerification.deleteMany({ _id: userId });
            req.session.message = "Invalid OTP,Please register again";
            res.redirect("/register");
          } else {
            req.session.userId =
              UserOTPVerificationRecords[0].userId.toString();
            await User.updateOne(
              { _id: UserOTPVerificationRecords[0].userId },
              { $set: { verified: true } }
            );
            await userOTPVerification.deleteMany({ _id: userId });
            res.redirect("/");
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    res.locals.session = req.session.userId;
    const products = await Product.find().populate("category");
    res.render("userHome", { products });
  } catch (error) {
    console.log(error.message);
  }
};

const singleProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const { userId } = req.session;
    const products = await Product.findById({ _id: id }).populate("category");
    res.render("singleProduct", { products: products, userId });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  loadRegister,
  insertUser,
  loginSuccess,
  emailVerification,
  loadHome,
  singleProduct,
  loadLogout,
};
