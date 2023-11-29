const userOTPVerification = require("../models/userOTPVerification");
const Subscription = require("../models/subscriptionModel");
const Category = require("../models/categoryModel");
const Wishlist = require("../models/wishListModel");
const Product = require("../models/productModel");
const Banner = require("../models/bannerModel");
const Comments = require("../models/comments");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const loadLogin = async (req, res, next) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    res.render("userLogin", { message });
  } catch (err) {
    next(err);
  }
};
const loginSuccess = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const loadRegister = async (req, res, next) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    res.render("userRegister", { message });
  } catch (err) {
    next(err);
  }
};
const insertUser = async (req, res, next) => {
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
        });
        const userData = await user.save();
        if (userData) {
          req.session.resendOTP = userData.email;
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
};
const emailVerificationPage = async (req, res, next) => {
  try {
    const { message, otpVerification, resendOTP } = req.session;
    req.session.otpVerification = null;
    req.session.message = "";
    res.render("userEmail", {
      message,
      otp: otpVerification,
      email: resendOTP,
    });
  } catch (err) {
    next(err);
  }
};
const emailVerification = async (req, res, next) => {
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
            let man = await User.updateOne(
              { _id: UserOTPVerificationRecords[0].userId },
              { $set: { verified: true } }
            );
            await userOTPVerification.deleteMany({ _id: userId });
            res.redirect("/");
          }
        }
      }
    }
  } catch (err) {
    next(err);
  }
};
const emailResendOTP = async (req, res, next) => {
  try {
    let { userVerificationId, email } = req.body;
    const userOTPVerificationRecords = await userOTPVerification.find({
      _id: userVerificationId,
    });
    if (
      !userOTPVerificationRecords ||
      userOTPVerificationRecords.length === 0
    ) {
      req.session.message = "User not found";
      return res.redirect("/register");
    }
    let userdata = {
      _id: userVerificationId,
      email: email,
    };
    let otpVerification = await sendOTPVerificationMail(userdata);
    req.session.message = "New OTP sent to your email";
    req.session.otpVerification = otpVerification;
    res.render("userEmail", {
      message: "New OTP sent to your email",
      otp: otpVerification,
      email: userdata.email,
    });
  } catch (err) {
    next(err);
  }
};

const loadHome = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

const shopPage = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const singleProduct = async (req, res, next) => {
  try {
    const { id } = req.query;
    const { userId } = req.session;
    const products = await Product.findById({ _id: id }).populate("category");
    res.render("singleProduct", { products: products, userId });
  } catch (err) {
    next(err);
  }
};
const loadLogout = async (req, res, next) => {
  try {
    req.session.userId = null;
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
const userProfile = async (req, res, next) => {
  try {
    let { message } = req.session;
    const { userId } = req.session;
    const walletHistory = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: { walletHistory: 1 },
      },
      {
        $unwind: "$walletHistory",
      },
      {
        $sort: { "walletHistory.date": -1 },
      },
    ]);
    req.session.message = "";
    const userProfile = await User.findById({ _id: userId });
    res.render("userProfile", { userProfile, message, walletHistory });
  } catch (err) {
    next(err);
  }
};
const editProfile = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const userProfile = await User.findById({ _id: userId });
    res.render("editProfile", { userProfile });
  } catch (err) {
    next(err);
  }
};
const updatedProfile = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const manageAddress = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const userAddresses = await User.findOne({ _id: userId });
    res.render("manageAddress", { userAddresses });
  } catch (err) {
    next(err);
  }
};
const addAddressPage = async (req, res, next) => {
  try {
    res.render("addAddress");
  } catch (err) {
    next(err);
  }
};
const addAddress = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const editAddress = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { id } = req.query;
    const userAddress = await User.findOne(
      { _id: userId },
      { address: { $elemMatch: { _id: id } } }
    );
    res.render("editAddress", { userAddress: userAddress });
  } catch (err) {
    next(err);
  }
};
const updatedAddress = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const deleteAddress = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { addId } = req.body;
    await User.updateOne(
      { _id: userId },
      { $pull: { address: { _id: addId } } }
    );
    res.status(201).json({ message: "success deleted" });
  } catch (err) {
    next(err);
  }
};
const orders = async (req, res, next) => {
  try {
    const { userId } = req.session;
    let currentDateObj = new Date();
    currentDateObj.setDate(currentDateObj.getDate());
    const currentDate = currentDateObj.toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const orders = await Order.find({ user: userId })
      .populate("items")
      .populate("user")
      .sort({ createdAt: -1 });
    res.render("orders", { orders, currentDate });
  } catch (err) {
    next(err);
  }
};
const viewOrdered = async (req, res, next) => {
  try {
    const { id } = req.query;
    const order = await Order.findById({ _id: id })
      .populate("user")
      .populate("items.product");
    res.render("viewOrdered", { order: order });
  } catch (err) {
    next(err);
  }
};
const changePassword = async (req, res, next) => {
  try {
    let { message, userId } = req.session;
    req.session.message = "";
    const userProfile = await User.findById({ _id: userId });
    res.render("changePassword", { message, userProfile });
  } catch (err) {
    next(err);
  }
};
const updatedPassword = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const returnOrder = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { orderId, expiredDate, grandTotal, returnReason } = req.body;
    let expiringDate = new Date(expiredDate);
    let todayDate = new Date();
    if (expiringDate > todayDate) {
      await Order.findByIdAndUpdate(
        { _id: orderId },
        { $set: { orderStatus: "Returned", returnReason: returnReason } }
      );
      await User.updateOne(
        { _id: userId },
        {
          $inc: { wallet: grandTotal },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: grandTotal,
              description: `refund for return the order ${orderId}`,
            },
          },
        }
      );
      const updatedReturn = await Order.findById({ _id: orderId });
      res.status(201).json({ message: updatedReturn.orderStatus });
    } else {
      res.status(400).json({ message: "Bad request" });
    }
  } catch (err) {
    next(err);
  }
};
const cancelOrder = async (req, res, next) => {
  try {
    const { userId } = req.session;
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
      if (
        orders.paymentMethod === "Razorpay" ||
        orders.paymentMethod === "Wallet"
      ) {
        await User.updateOne(
          { _id: userId },
          {
            $inc: { wallet: orders.grandTotal },
            $push: {
              walletHistory: {
                date: new Date(),
                amount: orders.grandTotal,
                description: `refund for cancellation of order ${orderId}`,
              },
            },
          }
        );
      }
      res.status(201).json({
        message: "Successfully updated and modified",
        status: status1,
      });
    } else {
      res.status(400).json({ message: "Seems like an error" });
    }
  } catch (err) {
    next(err);
  }
};
const wishList = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const products = await Wishlist.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    res.render("wishList", { products: products, userId });
  } catch (err) {
    next(err);
  }
};
const addToWishList = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
const deleteFromWishList = async (req, res, next) => {
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
    const wishList = await Wishlist.findOne({ userId: userId });
    res.status(201).json({
      message: "success and modified",
      wishListLength: wishList.items.length,
    });
  } catch (err) {
    next(err);
  }
};
const subscription = async (req, res, next) => {
  try {
    const { email } = req.body;
    const findSubscription = await Subscription.findOne({ email: email });
    if (findSubscription) {
      res.json({ message: false });
    } else {
      const newSubscription = new Subscription({
        email: email,
      });
      await newSubscription.save();
      res.json({ message: true });
    }
  } catch (error) {
    next(err);
  }
};
const comments = async (req, res, next) => {
  try {
    const { productId, name, email, number, message } = req.body;
    const newComment = new Comments({
      product: productId,
      date: new Date(),
      fullName: name,
      emailAddress: email,
      phoneNumber: number,
      message: message,
    });
    const update = await newComment.save();
    if (update) {
      res.json({ message: true });
    } else {
      res.json({ message: false });
    }
  } catch (err) {
    next(err);
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
  emailResendOTP,
  changePassword,
  singleProduct,
  manageAddress,
  addToWishList,
  deleteAddress,
  subscription,
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
  shopPage,
  loadHome,
  comments,
  wishList,
  orders,
};
