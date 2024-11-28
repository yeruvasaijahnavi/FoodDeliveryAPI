const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Import route files
const foodRoutes = require("./routes/foods");
const orderRoutes = require("./routes/orders");
const deliveryRoutes = require("./routes/delivery");
const authRoutes = require("./routes/auth");

// Middleware
app.use(express.json());

// Routes
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/auth", authRoutes);

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
