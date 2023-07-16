require("dotenv").config();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

var instance = new Razorpay({
  key_id: process.env.paymentId,
  key_secret: process.env.paymentSecret,
});

const orderPlaced = async (req, res) => {
  try {
    const { userId } = req.session;
    const { address, product_grandTotal, selector, orderNote } = req.body;
    const status = selector === "COD" ? "Placed" : "Pending";
    const cart = await Cart.findOne({ userId: userId });
    const updatedArr = cart.items;
    const items = updatedArr.map((product) => ({
      product: new mongoose.Types.ObjectId(product.product_Id),
      quantity: product.quantity,
      price: product.product_Id.price,
    }));
    const insertOrder = new Order({
      date: new Date().toLocaleString("en-Us", { timeZone: "Asia/Kolkata" }),
      user: new mongoose.Types.ObjectId(userId),
      address: address,
      items: items,
      orderNote: orderNote,
      grandTotal: product_grandTotal,
      paymentMethod: selector,
      orderStatus: status,
    });
    const orderPlaced = await insertOrder.save();
    if (status === "Placed") {
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
