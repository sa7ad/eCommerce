const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  list: {
    type: Boolean,
    default: true,
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
