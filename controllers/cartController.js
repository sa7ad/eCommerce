const Cart = require("../models/cartModel");
const mongoose = require("mongoose");

const loadCart = async (req, res) => {
  try {
    const {userId} = req.session
    const products = await Cart.findOne({userId:userId}).populate('items.product_Id')
    console.log(products,'this is items in the cart');
    res.render("cart",{products});
  } catch (error) {
    console.log(error.message);
  }
};
const addToCart = async (req, res) => {
  try {
    const { userId } = req.session;
    const { product_Id, product_quantity } = req.body;
    const userCart = await Cart.findOne({ userId: userId });
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
              },
            },
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
          },
        ],
      });
      await makeCart.save();
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadCart,
  addToCart,
};
