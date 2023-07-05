const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      product_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      total: {
        type: Number,
      },
      grandTotal: {
        type: Number,
      },
    },
  ],
  count: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
