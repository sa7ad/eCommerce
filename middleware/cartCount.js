const Cart = require("../models/cartModel");

const cartCount = async (req, res, next) => {
  if (req.session.userId) {
    const { userId } = req.session;
    const cartCount = await Cart.findOne({ userId: userId });
    if (cartCount) {
      res.locals.count = cartCount.items.length;
      const { count } = res.locals;
      next();
    } else {
      res.locals.count = 0;
      const { count } = res.locals;
      next();
    }
  } else {
    res.locals.count = 0;
    const { count } = res.locals;
    next();
  }
};

module.exports = cartCount;
