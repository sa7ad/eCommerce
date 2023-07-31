require("dotenv").config();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

var instance = new Razorpay({
  key_id: process.env.paymentId,
  key_secret: process.env.paymentSecret,
});

const orderPlaced = async (req, res) => {
  try {
    const { userId, couponCode } = req.session;
    let { discountAmount } = req.session;
    if (!discountAmount) {
      discountAmount = 0;
    }
    const { address, selector, orderNote, walletChecked } = req.body;
    let { product_grandTotal } = req.body;
    const status = selector === "COD" || "Wallet" ? "Placed" : "Pending";
    const walletAmount = await User.findOne({ _id: userId });
    if (walletChecked !== null) {
      let product = parseInt(product_grandTotal);
      let wallet = parseInt(walletChecked);
      product_grandTotal = product - wallet >= 0 ? product - wallet : 0;
      if (product_grandTotal !== 0) {
        await User.updateOne({ _id: userId }, { $inc: { wallet: -wallet } });
      } else {
        await User.updateOne(
          { _id: userId },
          { $set: { wallet: wallet - product } }
        );
      }
    }
    const cart = await Cart.findOne({ userId: userId });
    const updatedArr = cart.items;
    const items = updatedArr.map((product) => ({
      product: new mongoose.Types.ObjectId(product.product_Id),
      quantity: product.quantity,
      price: product.product_Id.price,
    }));
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
    } else if (
      status === "Placed" &&
      orderPlaced.paymentMethod === "Wallet" &&
      orderPlaced.grandTotal > walletAmount.wallet
    ) {
      req.session.message =
        "Cannot Purchase,Total Amount is greater than Wallet Balance";
      res.redirect("/placeOrder");
    } else if (status === "Placed" && orderPlaced.paymentMethod === "Wallet") {
      for (let item of items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: -item.quantity } }
        );
      }
      await User.updateOne(
        { _id: userId },
        {
          $inc: { wallet: -orderPlaced.grandTotal },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: -orderPlaced.grandTotal,
              description: "Order placed using wallet amount",
            },
          },
        }
      );
      await Cart.deleteOne({ userId: userId });
      res.json({ walletSuccess: true });
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
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};

const validatePaymentVerification = async (req, res) => {
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
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { orderPlaced, validatePaymentVerification };
