// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
	{
		action: { type: String, required: true }, // Action performed (e.g., 'order created', 'status updated', etc.)
		timestamp: { type: Date, default: Date.now }, // Timestamp of the action
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		}, // User who performed the action
		details: { type: String, required: true }, // Additional details (e.g., order ID, food item ID)
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt fields
	}
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
