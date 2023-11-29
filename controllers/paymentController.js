const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
require("dotenv").config();

var instance = new Razorpay({
  key_id: process.env.paymentId,
  key_secret: process.env.paymentSecret,
});

const orderPlaced = async (req, res, next) => {
  try {
    const { userId, couponCode } = req.session;
    let { discountAmount } = req.session;
    if (!discountAmount) {
      discountAmount = 0;
    }
    const { address, selector, orderNote, walletChecked } = req.body;
    let { product_grandTotal } = req.body;
    const status = selector === "COD" || "Wallet" ? "Placed" : "Pending";
    const cart = await Cart.findOne({ userId: userId });
    const updatedArr = cart.items;
    const items = updatedArr.map((product) => ({
      product: new mongoose.Types.ObjectId(product.product_Id),
      quantity: product.quantity,
      price: product.product_Id.price,
    }));
    if (walletChecked !== undefined) {
      let product = parseInt(product_grandTotal);
      let wallet = parseInt(walletChecked);
      product_grandTotal = product - wallet >= 0 ? product - wallet : 0;
      if (product_grandTotal !== 0) {
        await User.updateOne(
          { _id: userId },
          {
            $inc: { wallet: -wallet },
            $push: {
              walletHistory: {
                date: new Date(),
                amount: -wallet,
                description: "Order placed using wallet amount",
              },
            },
          }
        );
      } else {
        await User.updateOne(
          { _id: userId },
          {
            $set: { wallet: wallet - product },
            $push: {
              walletHistory: {
                date: new Date(),
                amount: -wallet,
                description: "Order placed using wallet amount",
              },
            },
          }
        );
      }
    }

    const date = new Date().toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "Asia/Kolkata",
    });
    let orderPlaced;
    if (couponCode !== null) {
      const insertOrder = new Order({
        date: date,
        user: new mongoose.Types.ObjectId(userId),
        address: address,
        items: items,
        orderNote: orderNote,
        total: product_grandTotal,
        discount: discountAmount,
        coupon: couponCode,
        grandTotal: product_grandTotal - discountAmount,
        paymentMethod: selector,
        orderStatus: status,
      });
      orderPlaced = await insertOrder.save();
    } else {
      const insertOrder = new Order({
        date: date,
        user: new mongoose.Types.ObjectId(userId),
        address: address,
        items: items,
        orderNote: orderNote,
        total: product_grandTotal,
        discount: discountAmount,
        grandTotal: product_grandTotal - discountAmount,
        paymentMethod: selector,
        orderStatus: status,
      });
      orderPlaced = await insertOrder.save();
    }
    if (status === "Placed" && orderPlaced.paymentMethod === "COD") {
      for (let item of items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: -item.quantity } }
        );
      }
      await Cart.deleteOne({ userId: userId });
      res.json({ codSuccess: true });
    } else {
      var options = {
        amount: orderPlaced.grandTotal * 100,
        currency: "INR",
        notes: orderNote,
        receipt: "" + orderPlaced._id,
      };
      instance.orders.create(options, function (err, order) {
        res.json({ order });
      });
    }
  } catch (err) {
    next(err);
  }
};

const validatePaymentVerification = async (req, res, next) => {
  try {
    const { body } = req;
    const { userId } = req.session;

    var crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.paymentSecret);
    hmac.update(
      body.payment.razorpay_order_id + "|" + body.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac === body.payment.razorpay_signature) {
      const items = await Order.findByIdAndUpdate(
        { _id: body.order.receipt },
        { $set: { paymentId: body.payment.razorpay_payment_id } }
      );
      await Order.findByIdAndUpdate(
        { _id: body.order.receipt },
        { $set: { orderStatus: "Placed" } }
      );
      for (let item of items.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: -item.quantity } }
        );
      }
      await Cart.deleteOne({ userId: userId });
      res.json({ success: true });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { orderPlaced, validatePaymentVerification };
