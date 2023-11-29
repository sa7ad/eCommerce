const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const mongoose = require("mongoose");

const loadCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const products = await Cart.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    res.render("cart", { products, userId });
  } catch (err) {
    next(err);
  }
};
const addToCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { product_Id, product_quantity, prdQuantity } = req.body;
    const userCart = await Cart.findOne({ userId: userId });
    const findPrice = await Product.findOne({ _id: product_Id });
    const total = product_quantity * findPrice.price;

    if (userCart) {
      const findProduct = await Cart.findOne({
        userId: userId,
        "items.product_Id": new mongoose.Types.ObjectId(product_Id),
      });
      if (findProduct) {
        const stockQuantity = await Cart.findOne(
          {
            userId: userId,
            "items.product_Id": product_Id,
          },
          {
            "items.$": 1,
          }
        );
        const cartQuantity = stockQuantity.items[0].quantity;
        if (cartQuantity < prdQuantity) {
          await Cart.findOneAndUpdate(
            {
              userId: userId,
              "items.product_Id": new mongoose.Types.ObjectId(product_Id),
            },
            {
              $inc: {
                "items.$.quantity": product_quantity,
                "items.$.total": total,
                grandTotal: total,
              },
            },
            { new: true }
          );
          const cart = await Cart.findOne({ userId: userId });
          res.json({ count: cart.items.length });
        } else {
          res.json({ limit: "limit exceeded" });
        }
      } else {
        await Cart.updateOne(
          { userId: userId },
          {
            $push: {
              items: {
                product_Id: new mongoose.Types.ObjectId(product_Id),
                quantity: product_quantity,
                total: total,
              },
            },
            $inc: { count: 1, grandTotal: total },
          }
        );
        const cart = await Cart.findOne({ userId: userId });
        res.json({ count: cart.items.length });
      }
    } else {
      const makeCart = new Cart({
        userId: userId,
        items: [
          {
            product_Id: new mongoose.Types.ObjectId(product_Id),
            quantity: product_quantity,
            count: 1,
            total: total,
          },
        ],
        grandTotal: total,
      });
      const makeCarts = await makeCart.save();
      res.json({ count: makeCart.items.length });
    }
  } catch (err) {
    next(err);
  }
};
const deleteFromCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    let { product_Id } = req.body;
    let productId = new mongoose.Types.ObjectId(product_Id);
    let cartDetails = await Cart.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.product_Id", productId] },
            },
          },
        },
      },
    ]);
    let TotalCost = cartDetails[0].items[0].total;
    const carttotal = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        $pull: { items: { product_Id: productId } },
        $inc: { count: -1, grandTotal: -TotalCost },
      },
      { new: true }
    );
    const length = carttotal.items.length;
    res.status(201).json({
      message: "success and modified",
      total: carttotal.grandTotal,
      cart: length,
    });
  } catch (err) {
    next(err);
  }
};
const cartCount = async (req, res, next) => {
  try {
    const { product_Id, userId, count } = req.body;
    const productPrice = await Product.findOne({ _id: product_Id });
    if (count === 1) {
      await Cart.findOneAndUpdate(
        {
          userId: userId,
          "items.product_Id": new mongoose.Types.ObjectId(product_Id),
        },
        {
          $inc: {
            "items.$.quantity": count,
            "items.$.total": productPrice.price,
            grandTotal: productPrice.price,
          },
        },
        { new: true }
      );
      const carttotal = await Cart.findOne({ userId: userId });
      res.json({ message: "success", total: carttotal.grandTotal });
    } else {
      await Cart.findOneAndUpdate(
        {
          userId: userId,
          "items.product_Id": new mongoose.Types.ObjectId(product_Id),
        },
        {
          $inc: {
            "items.$.quantity": count,
            "items.$.total": -productPrice.price,
            grandTotal: -productPrice.price,
          },
        },
        { new: true }
      );
      const carttotal = await Cart.findOne({ userId: userId });
      res.json({ message: "success", total: carttotal.grandTotal });
    }
  } catch (err) {
    next(err);
  }
};
const addOrderAddress = async (req, res, next) => {
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
    res.redirect("/placeOrder");
  } catch (err) {
    next(err);
  }
};
const placeOrder = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const moment = require("moment");
    req.session.couponApplied = false;
    req.session.discountAmount = 0;
    const currentDate = new Date();
    req.session.message = "";
    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    const coupon = await Coupon.find({
      expireDate: { $gte: new Date(currentDate) },
    });
    const address = await User.findOne({ _id: userId });
    res.render("placeOrder", {
      address: address,
      carts: cart,
      coupon: coupon,
      wallet: address.wallet,
      currentDate: currentDate,
      moment: moment,
    });
  } catch (err) {
    next(err);
  }
};
const applyCoupon = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { selectedCoupon } = req.body;
    const couponApplied = await Coupon.findOne({ code: selectedCoupon });
    const alreadyUsed = await Order.findOne({
      $and: [
        { coupon: couponApplied._id },
        { user: new mongoose.Types.ObjectId(userId) },
      ],
    });
    const cartValue = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (couponApplied) {
      if (req.session.couponApplied === false) {
        if (!alreadyUsed) {
          let currDate = new Date();
          if (currDate < couponApplied.expireDate) {
            const discountAmount = Math.round(
              (cartValue.grandTotal * couponApplied.percentage) / 100
            );
            const grandTotalDiscounted = cartValue.grandTotal - discountAmount;
            req.session.couponApplied = true;
            req.session.couponCode = couponApplied._id;
            req.session.discountAmount = discountAmount;
            res.json({
              message: true,
              discountAmount: discountAmount,
              cartTotal: grandTotalDiscounted,
            });
          } else {
            res.json({ expired: true });
          }
        } else {
          res.json({ alreadyUsed: true });
        }
      } else {
        res.json({ onetime: true });
      }
    } else {
      res.json({ message: false });
    }
  } catch (err) {
    next(err);
  }
};
const removeCoupon = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { selectedCouponId } = req.body;
    const couponApplied = await Coupon.findOne({ code: selectedCouponId });
    const cartValue = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (couponApplied) {
      if (req.session.couponApplied === true) {
        let discountAmount = 0;
        req.session.couponApplied = false;
        req.session.couponCode = null;
        req.session.discountAmount = discountAmount;
      }
      res.json({
        message: true,
        discountAmount: "",
        cartTotal: cartValue.grandTotal,
      });
    } else {
      res.json({ message: false });
    }
  } catch (err) {
    next(err);
  }
};
const orderPlacedSuccess = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const details = await Order.findOne({ user: userId }).sort({
      createdAt: -1,
    });
    res.render("orderPlaced", { order: details });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  orderPlacedSuccess,
  addOrderAddress,
  deleteFromCart,
  placeOrder,
  addToCart,
  cartCount,
  loadCart,
  applyCoupon,
  removeCoupon,
};
