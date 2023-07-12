const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const mongoose = require("mongoose");

const loadCart = async (req, res) => {
  try {
    const { userId } = req.session;
    const products = await Cart.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    res.render("cart", { products, userId });
  } catch (error) {
    res.redirect("/error500");
  }
};
const addToCart = async (req, res) => {
  try {
    const { userId } = req.session;
    const { product_Id, product_quantity } = req.body;
    const userCart = await Cart.findOne({ userId: userId });
    const findPrice = await Product.findOne({ _id: product_Id });
    const total = product_quantity * findPrice.price;
    if (userCart) {
      const findProduct = await Cart.findOne({
        userId: userId,
        "items.product_Id": new mongoose.Types.ObjectId(product_Id),
      });
      if (findProduct) {
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
      await makeCart.save();
    }
  } catch (error) {
    res.redirect("/error500");
  }
};
const deleteFromCart = async (req, res) => {
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

    await Cart.updateOne(
      { userId: userId },
      {
        $pull: { items: { product_Id: productId } },
        $inc: { count: -1, grandTotal: -TotalCost },
      }
    );
    const carttotal = await Cart.findOne({ userId: userId });
    res
      .status(201)
      .json({ message: "success and modified", total: carttotal.grandTotal });
  } catch (error) {
    res.redirect("/error500");
  }
};
const cartCount = async (req, res) => {
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
  } catch (error) {
    res.redirect("/error500");
  }
};
const placeOrder = async (req, res) => {
  try {
    const { userId } = req.session;
    const cart = await Cart.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    const address = await User.findOne({ _id: userId });
    res.render("placeOrder", { address: address, carts: cart });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const orderPlaced = async (req, res) => {
  try {
    const { userId } = req.session;
    const { address, product_grandTotal, selector } = req.body;
    const cart = await Cart.findOne({ userId: userId });
    const updatedArr = cart.items;
    const items = updatedArr.map((product) => ({
      product: new mongoose.Types.ObjectId(product.product_Id),
      quantity: product.quantity,
      price: product.product_Id.price,
    }));
    const insertOrder = new Order({
      date: new Date().toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
      }),
      user: new mongoose.Types.ObjectId(userId),
      address: address,
      items: items,
      grandTotal: product_grandTotal,
      paymentMethod: selector,
    });
    const orderPlaced = await insertOrder.save();
    if (orderPlaced) {
      for (let item of items) {
        const updatedQuantity = await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: -item.quantity } }
        );
      }
      await Cart.deleteOne({ userId: userId });
    } else {
      res.redirect("/");
    }
    res.redirect("/orderPlaced");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error500");
  }
};
const orderPlacedSuccess = async (req, res) => {
  try {
    const { userId } = req.session;
    const details = await Order.findOne({ user: userId }).sort({date:-1,_id:-1})
    res.render("orderPlaced", { order: details });
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
  }
};
module.exports = {
  orderPlacedSuccess,
  deleteFromCart,
  orderPlaced,
  placeOrder,
  addToCart,
  cartCount,
  error500,
  loadCart,
};
