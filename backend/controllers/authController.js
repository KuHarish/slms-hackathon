const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // We map 'name' to 'fullName' to preserve compatibility with existing frontend requests
    const newUser = new User({
      fullName: name,
      email,
      password: hashedPassword,
      role: role && ['user', 'admin'].includes(role) ? role : 'user'
    });

    await newUser.save();

    res.status(201).json({ message: "User Registered Successfully ✅" });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
      
    // Update lastLogin on successful login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login Successful ✅", token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("booksBorrowed");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Convert _id to id to match frontend expectation
    const userData = user.toObject();
    userData.id = userData._id;
    userData.name = userData.fullName;

    res.json(userData);
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
