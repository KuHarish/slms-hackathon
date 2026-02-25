require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

console.log("PORT:", PORT);
console.log("MONGO_URI:", MONGO_URI);

app.use(cors());
app.use(express.json());

// MongoDB connection using MongoClient (like Atlas example)
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "✅ Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (err) {
    console.log("❌ MongoDB Connection Error:");
    console.log(err.message);
    // Try to close the client if it exists
    try {
      await client.close();
    } catch (closeErr) {
      // Ignore close errors
    }
  }
}

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
