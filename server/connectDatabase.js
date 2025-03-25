const mongoose = require("mongoose");

async function connectDB(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 30s timeout
        socketTimeoutMS: 45000, // 45s socket timeout
      });
      console.log("✅ MongoDB Connected Successfully");
      return; // Exit loop if connected
    } catch (error) {
      console.error(
        `❌ MongoDB Connection Failed (${i + 1}/${retries})`,
        error.message
      );
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
      } else {
        console.error("🚨 All retries failed. Exiting...");
        process.exit(1);
      }
    }
  }
}

// Handle disconnection globally (only set the listener once)
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected! Retrying...");
  connectDB();
});

module.exports = connectDB;
