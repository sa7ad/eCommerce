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
    address: {
      type: String,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    orderNote: {
      type: String,
    },
    grandTotal: {
      type: Number,
    },
    orderStatus: {
      type: String,
      default: "Pending",
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
