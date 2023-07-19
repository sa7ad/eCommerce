const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone_number: {
    type: Number,
    required: true,
  },
  address: [
    {
      name: {
        type: String,
      },
      housename: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      phone: {
        type: Number,
      },
      pincode: {
        type: Number,
      },
    },
  ],
  password: {
    type: String,
    required: true,
  },
  confirm_password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
  },
  blocked: {
    type: Boolean,
  },
},{timestamps:true});

module.exports = mongoose.model("User", userSchema);
