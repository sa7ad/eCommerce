const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    applicableLimit: {
      type: Number,
      required: true,
    },
    list: {
      type: Boolean,
      required: true,
      default: true,
    },
    expireDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
