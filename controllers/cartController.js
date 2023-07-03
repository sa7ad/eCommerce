const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

const loadCart = async (req, res) => {
  try {
    const { userId } = req.session;
    const products = await Cart.findOne({ userId: userId }).populate(
      "items.product_Id"
    );
    res.render("cart", { products, userId });
  } catch (error) {
    console.log(error.message);
  }
};
const addToCart = async (req, res) => {
  try {
    const { userId } = req.session;
    const { product_Id, product_quantity } = req.body;
    const userCart = await Cart.findOne({ userId: userId });
    const findPrice = await Product.findOne({ _id: product_Id });
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
          { $inc: { "items.$.quantity": product_quantity } },
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
                total: findPrice.price,
              },
            },
            $inc: { count: 1 },
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
            total: findPrice.price,
          },
        ],
      });
      await makeCart.save();
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteFromCart = async (req, res) => {
  try {
    const { userId } = req.session;
    let { product_Id } = req.body;
    let productId = new mongoose.Types.ObjectId(product_Id);
    await Cart.updateOne(
      { userId: userId },
      { $pull: { items: { product_Id: productId } }, $inc: { count: -1 } }
    );
    res.status(201).json({ message: "success and modified" });
  } catch (error) {
    console.log(error.message);
  }
};
const cartCount = async (req, res) => {
  try {
    const { product_Id, userId, count } = req.body;
    const productPrice = await Product.findOne({ _id: product_Id });
    if (count === 1) {
      const item = await Cart.findOneAndUpdate(
        {
          userId: userId,
          "items.product_Id": new mongoose.Types.ObjectId(product_Id),
        },
        {
          $inc: {
            "items.$.quantity": count,
            "items.$.total": productPrice.price,
          },
        },
        { new: true }
      );
      res.json({ message: "success" });
    } else {
      const item = await Cart.findOneAndUpdate(
        {
          userId: userId,
          "items.product_Id": new mongoose.Types.ObjectId(product_Id),
        },
        {
          $inc: {
            "items.$.quantity": count,
            "items.$.total": -productPrice.price,
          },
        },
        { new: true }
      );
      res.json({ message: "success" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadCart,
  addToCart,
  deleteFromCart,
  cartCount,
};
