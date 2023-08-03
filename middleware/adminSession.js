const isAdminLogin = async (req, res, next) => {
  try {
    if (req.session.adminSession) {
      next();
    } else {
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = isAdminLogin;
