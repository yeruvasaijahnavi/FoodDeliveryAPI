const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	foodItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
	totalPrice: Number,
	status: {
		type: String,
		enum: ["pending", "accepted", "completed"],
		default: "pending",
	},
	deliveryMan: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Order", orderSchema);
