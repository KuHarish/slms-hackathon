require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/books", bookRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", transactionRoutes);


app.get("/", (req, res) => {
  res.send("API Working");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});