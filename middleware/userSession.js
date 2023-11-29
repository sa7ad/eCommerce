const User = require("../models/userModel");

const isLogin = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const user = await User.findOne({ _id: userId });
    if (req.session.userId && user.blocked === false) {
      res.locals.session = req.session.userId;
      next();
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};
const isLogout = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const user = await User.findOne({ _id: userId });
    if (req.session.userId && user.blocked === false) {
      res.locals.session = req.session.userId;
      res.redirect("/");
    } else {
      next();
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
