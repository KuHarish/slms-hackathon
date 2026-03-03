const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ── Register ─────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // New users always start with a clean slate (empty arrays, zero counts)
    const newUser = new User({
      fullName: name,
      email,
      password: hashedPassword,
      role: role && ['user', 'admin'].includes(role) ? role : 'user',
      booksBorrowed:    [],
      booksRead:        [],
      dueBooks:         [],
      readingHistory:   [],
      totalBorrowedCount: 0,
      overdueBooksCount:  0,
      tokens:             0,
      fineAmount:         0,
    });

    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully ✅" });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Use $set to ONLY update lastLogin — never triggers Mongoose defaults on other fields
    // This prevents new schema defaults from being written to existing user documents
    await User.findByIdAndUpdate(
      user._id,
      { $set: { lastLogin: new Date() } },
      { strict: false }
    );

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login Successful ✅", token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// ── Get current user ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("booksBorrowed", "title author coverUrl")
      .populate("booksRead", "title author coverUrl")
      .populate("dueBooks.bookId", "title author coverUrl");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toObject();
    userData.id   = userData._id;
    userData.name = userData.fullName;

    // Live-calculate overdue count from dueBooks array
    const now = new Date();
    userData.overdueBooksCount = (userData.dueBooks || []).filter(
      d => d.dueDate && new Date(d.dueDate) < now
    ).length || userData.overdueBooksCount || 0;

    // Ensure no undefined arrays reach the frontend
    userData.booksBorrowed  = userData.booksBorrowed  || [];
    userData.booksRead      = userData.booksRead      || [];
    userData.dueBooks       = userData.dueBooks       || [];
    userData.readingHistory = userData.readingHistory || [];
    userData.badges         = userData.badges         || [];

    res.json(userData);
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { registerUser, loginUser, getMe };
