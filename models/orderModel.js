const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    expiredDate: {
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
    cancelReason: {
      type: String,
    },
    returnReason:{
      type:String
    },
    grandTotal: {
      type: Number,
    },
    orderStatus: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    coupon:{
      type:mongoose.Schema.Types.ObjectId
     },
    discount:{
      type:Number
     },
     total:{
      type:Number
     },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
