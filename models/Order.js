// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	foodItems: [{ type: String, required: true }], // Store food names as strings
	totalPrice: Number,
	status: {
		type: String,
		enum: ["pending", "accepted", "delivered"],
		default: "pending",
	},
	deliveryMan: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	deliveryManEmail: String,
});

module.exports = mongoose.model("Order", orderSchema);
