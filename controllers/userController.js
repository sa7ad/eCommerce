const userOTPVerification = require("../models/userOTPVerification");
const Banner = require("../models/bannerModel");
const Wishlist = require("../models/wishListModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const loadLogin = async (req, res) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    res.render("userLogin", { message });
  } catch (error) {
    res.redirect("/error500");
  }
};
const loginSuccess = async (req, res) => {
  try {
    const { email, password } = req.body;
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
    res.redirect("/error500");
  }
};
const loadRegister = async (req, res) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    res.render("userRegister", { message });
  } catch (error) {
    res.redirect("/error500");
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
      const { password } = req.body;
      const { confirm_password } = req.body;
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
          req.session.otpVerification = otpVerification;
          res.redirect("/emailVerification");
        } else {
          req.session.message = "Invalid Verification";
          res.redirect("/register");
        }
      } else {
        req.session.message = "Passwords does not match";
        res.redirect("/register");
      }
    }
  } catch (error) {
    res.redirect("/error500");
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
    console.log(otp, "this is otp in userController");
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
    res.redirect("/error500");
  }
};
const emailVerificationPage = async (req, res) => {
  try {
    const { message, otpVerification } = req.session;
    req.session.otpVerification = null;
    req.session.message = "";
    res.render("userEmail", { message, otp: otpVerification });
  } catch (error) {
    res.redirect("/error500");
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
      req.session.message = "Invalid OTP details,please try again";
      res.redirect("/emailVerification");
    } else {
      if (UserOTPVerificationRecords.length <= 0) {
        req.session.message = "Invalid OTP,Please register again";
        res.redirect("/emailVerification");
      } else {
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;
        if (expiresAt < Date.now()) {
          await User.deleteMany({ _id: UserOTPVerificationRecords[0].userId });
          await userOTPVerification.deleteMany({ _id: userId });
          req.session.message = "Invalid OTP,Please register again";
          res.redirect("/register");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            await User.deleteMany({
              _id: UserOTPVerificationRecords[0].userId,
            });
            req.session.otpVerification = userVerificationId;
            req.session.message = "Invalid OTP,Please register again";
            res.redirect("/emailVerification");
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
    res.redirect("/error500");
  }
};
const loadHome = async (req, res) => {
  try {
    const { userId } = req.session;
    res.locals.session = userId;
    const banner = await Banner.find({ title: "Main Banner" });
    const bannerNews = await Banner.find({ title: "News" });
    const products = await Product.find({ list: true }).populate("category");
    const brands = await Product.distinct("brand");
    if (products) {
      res.render("userHome", { products, brands, banner, bannerNews });
    }
  } catch (error) {
    res.redirect("/error500");
  }
};

const shopPage = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 6;
    const { category, search, brand, sort } = req.query;
    let page = Number(req.query.page);
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    const condition = { list: true };
    if (category) {
      condition.category = category;
    }
    if (search) {
      condition.name = { $regex: search, $options: "i" };
    }
    if (brand) {
      condition.brand = brand;
    }
    const sortOptions = {};
    if (sort === "price-asc") {
      sortOptions.price = 1;
    } else if (sort === "price-desc") {
      sortOptions.price = -1;
    } else {
      sortOptions.createdAt = -1;
    }
    const products = await Product.find(condition)
      .sort(sortOptions)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("category");

    const productCount = await Product.find(condition).count();
    const categoryFind = await Category.find({ list: true });
    const brandFind = await Product.distinct("brand");

    res.render("shopPage", {
      products,
      categoryFind,
      category,
      search,
      brandFind,
      brand,
      sort,
      totalCount: productCount,
      currentPage: page,
      hasNextPage: page * ITEMS_PER_PAGE < productCount,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(productCount / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const singleProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const { userId } = req.session;
    const products = await Product.findById({ _id: id }).populate("category");
    res.render("singleProduct", { products: products, userId });
  } catch (error) {
    res.redirect("/error500");
  }
};
const loadLogout = async (req, res) => {
  try {
    req.session.userId = null;
    res.redirect("/");
  } catch (error) {
    res.redirect("/error500");
  }
};
const userProfile = async (req, res) => {
  try {
    let { message } = req.session;
    const { userId } = req.session;
    req.session.message = "";
    const userProfile = await User.findById({ _id: userId });
    res.render("userProfile", { userProfile, message });
  } catch (error) {
    res.redirect("/error500");
  }
};
const editProfile = async (req, res) => {
  try {
    const { userId } = req.session;
    const userProfile = await User.findById({ _id: userId });
    res.render("editProfile", { userProfile });
  } catch (error) {
    res.redirect("/error500");
  }
};
const updatedProfile = async (req, res) => {
  try {
    const { userId } = req.session;
    const { first_name, last_name, email, phone_number } = req.body;
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone_number: phone_number,
        },
      }
    );
    res.redirect("/userProfile");
  } catch (error) {
    res.redirect("/error500");
  }
};
const manageAddress = async (req, res) => {
  try {
    const { userId } = req.session;
    const userAddresses = await User.findOne({ _id: userId });
    res.render("manageAddress", { userAddresses });
  } catch (error) {
    res.redirect("/error500");
  }
};
const addAddressPage = async (req, res) => {
  try {
    res.render("addAddress");
  } catch (error) {
    res.redirect("/error500");
  }
};
const addAddress = async (req, res) => {
  try {
    const { userId } = req.session;
    const { name, housename, city, state, phone, pincode } = req.body;
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          address: {
            name: name,
            housename: housename,
            city: city,
            state: state,
            phone: phone,
            pincode: pincode,
          },
        },
      }
    );
    res.redirect("/manageAddress");
  } catch (error) {
    res.redirect("/error500");
  }
};
const editAddress = async (req, res) => {
  try {
    const { userId } = req.session;
    const { id } = req.query;
    const userAddress = await User.findOne(
      { _id: userId },
      { address: { $elemMatch: { _id: id } } }
    );
    res.render("editAddress", { userAddress: userAddress });
  } catch (error) {
    res.redirect("/error500");
  }
};
const updatedAddress = async (req, res) => {
  try {
    const { userId } = req.session;
    const { id, name, housename, city, state, pincode, phone } = req.body;
    await User.updateOne(
      { _id: userId, "address._id": id },
      {
        $set: {
          "address.$.name": name,
          "address.$.housename": housename,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.pincode": pincode,
          "address.$.phone": phone,
        },
      }
    );
    res.redirect("/manageAddress");
  } catch (error) {
    res.redirect("/error500");
  }
};
const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.session;
    const { addId } = req.body;
    await User.updateOne(
      { _id: userId },
      { $pull: { address: { _id: addId } } }
    );
    res.status(201).json({ message: "success deleted" });
  } catch (error) {
    res.redirect("/error500");
  }
};
const orders = async (req, res) => {
  try {
    const { userId } = req.session;
    let currentDate = new Date();
    const orders = await Order.find({ user: userId })
      .populate("items")
      .populate("user")
      .sort({ createdAt: -1 });
    res.render("orders", { orders, currentDate });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const viewOrdered = async (req, res) => {
  try {
    const { id } = req.query;
    const order = await Order.findById({ _id: id })
      .populate("user")
      .populate("items.product");
    res.render("viewOrdered", { order: order });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const changePassword = async (req, res) => {
  try {
    let { message, userId } = req.session;
    req.session.message = "";
    const userProfile = await User.findById({ _id: userId });
    res.render("changePassword", { message, userProfile });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const updatedPassword = async (req, res) => {
  try {
    const { userId } = req.session;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findOne({ _id: userId });
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (passwordMatch) {
      if (newPassword === confirmNewPassword) {
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const confirmHashPassword = await bcrypt.hash(confirmNewPassword, 10);
        await User.updateOne(
          { _id: userId },
          {
            $set: {
              password: hashPassword,
              confirm_password: confirmHashPassword,
            },
          }
        );
        req.session.message = "Password has been updated successfully";
        res.redirect("/userProfile");
      } else {
        req.session.message =
          "Your new password does not match with confirm password";
        res.redirect("/changePassword");
      }
    } else {
      req.session.message = "Your current password does not match";
      res.redirect("/changePassword");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const returnOrder = async (req, res) => {
  try {
    const { userId } = req.session;
    const { orderId, expiredDate, grandTotal } = req.body;
    let expiringDate = new Date(expiredDate);
    let todayDate = new Date();
    if (expiringDate > todayDate) {
      await Order.findByIdAndUpdate(
        { _id: orderId },
        { $set: { orderStatus: "Returned" } }
      );
      await User.updateOne({ _id: userId }, { $inc: { wallet: grandTotal } });
      const updatedReturn = await Order.findById({ _id: orderId });
      res.status(201).json({ message: updatedReturn.orderStatus });
    } else {
      res.status(400).json({ message: "Bad request" });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const cancelOrder = async (req, res) => {
  try {
    const { orderId, cancelReason } = req.body;
    let status1 = "Cancelled";
    const cancelOrder = await Order.updateOne(
      { _id: orderId },
      { $set: { orderStatus: status1, cancelReason: cancelReason } }
    );
    if (cancelOrder) {
      const orders = await Order.findById({ _id: orderId });
      for (let order of orders.items) {
        await Product.updateOne(
          { _id: order.product },
          { $inc: { quantity: order.quantity } }
        );
      }
      res.status(201).json({
        message: "Successfully updated and modified",
        status: status1,
      });
    } else {
      res.status(400).json({ message: "Seems like an error" });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const wishList = async (req, res) => {
  try {
    const { userId } = req.session;
    const products = await Wishlist.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    res.render("wishList", { products: products, userId });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const addToWishList = async (req, res) => {
  try {
    const { userId } = req.session;
    const { product_Id } = req.body;
    const userWishlist = await Wishlist.findOne({ userId: userId });
    if (userWishlist) {
      const findProduct = await Wishlist.findOne({
        userId: userId,
        "items.product_Id": new mongoose.Types.ObjectId(product_Id),
      });
      if (findProduct) {
        await Wishlist.findOneAndUpdate(
          {
            userId: userId,
            "items.product_Id": new mongoose.Types.ObjectId(product_Id),
          },
          { new: true }
        );
      } else {
        await Wishlist.updateOne(
          { userId: userId },
          {
            $push: {
              items: {
                product_Id: new mongoose.Types.ObjectId(product_Id),
              },
            },
          }
        );
      }
    } else {
      const makeWishList = new Wishlist({
        userId: userId,
        items: [
          {
            product_Id: new mongoose.Types.ObjectId(product_Id),
          },
        ],
      });
      await makeWishList.save();
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteFromWishList = async (req, res) => {
  try {
    const { userId } = req.session;
    let { product_Id } = req.body;
    let productId = new mongoose.Types.ObjectId(product_Id);
    await Wishlist.updateOne(
      { userId: userId },
      {
        $pull: { items: { product_Id: productId } },
      }
    );
    res.status(201).json({
      message: "success and modified",
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const error500 = async (req, res) => {
  try {
    res.render("error500");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};

module.exports = {
  emailVerificationPage,
  deleteFromWishList,
  emailVerification,
  updatedPassword,
  addAddressPage,
  updatedProfile,
  updatedAddress,
  changePassword,
  singleProduct,
  manageAddress,
  addToWishList,
  deleteAddress,
  loginSuccess,
  loadRegister,
  editProfile,
  returnOrder,
  userProfile,
  cancelOrder,
  viewOrdered,
  editAddress,
  loadLogout,
  addAddress,
  insertUser,
  loadLogin,
  error500,
  shopPage,
  loadHome,
  wishList,
  orders,
};
