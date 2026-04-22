const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Blacklist = require("../models/blacklist.model");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    const blacklistedToken = await Blacklist.findOne({ token });

    if (blacklistedToken) {
      return res.status(401).json({
        message: "Token is blacklisted, please login again",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

module.exports = protect;
