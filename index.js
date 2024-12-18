const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Import route files
const foodRoutes = require("./routes/foods");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const logRoutes = require("./routes/logs");

// Middleware
app.use(express.json());

// Routes
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
	console.error("MongoDB URI is not defined in the environment variables.");
	process.exit(1);
}

mongoose
	.connect(mongoUri)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Failed to connect to MongoDB", err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
