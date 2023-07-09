const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cart: [
      {
        cart: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cart",
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    orderStatus: {
      type: String,
      default:'Pending',
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
