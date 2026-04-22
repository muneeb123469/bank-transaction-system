const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model");
const sendEmail = require("../services/email.service");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 3. Create new user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to Bank Transaction System",
      text: `Hello ${user.fullName}, your account has been created successfully.`,
      html: `<h2>Welcome, ${user.fullName}!</h2><p>Your account has been created successfully in the Bank Transaction System.</p>`,
    });

    // 4. Send response (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id);
    // 5. Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 6. Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        systemUser: user.systemUser,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.decode(token);

      if (decoded && decoded.exp) {
        await Blacklist.create({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        });
      }
    }

    res.clearCookie("token");

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
