const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, collegeId, phone, department, year, password, role, clubName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      collegeId,
      phone,
      department,
      year,
      password,
      role: role || "student",
      clubName: role === "club_admin" ? clubName : undefined
    });

    // Generate OTP (for email verification)
    const otp = user.generateOTP();
    await user.save();

    // In real app: Send OTP via email
    // For now, log to console
    console.log(`OTP for ${email}: ${otp}`);

    res.status(201).json({
      message: "User registered. OTP sent to email.",
      userId: user._id,
      otp: otp, // Remove in production - only for testing
      email: user.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    // Check OTP expiry
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }
    
    // Mark email as verified
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};