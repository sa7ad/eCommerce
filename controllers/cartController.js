const Cart = require("../models/cartModel");
const mongoose = require("mongoose");

const loadCart = async (req, res) => {
  try {
    res.render("cart");
  } catch (error) {
    console.log(error.message);
  }
};
const addToCart = async (req, res) => {
  try {
    
    const { userId } = req.session;
    const { product_Id ,quantity} =req.body;
      console.log(quantity)
    console.log(req.body.product_Id, "thsi is product id");
    const userCart =await Cart.findOne({ userId: userId })
    console.log(userCart,'thugffhffghfghffh');

  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadCart,
  addToCart,
};
