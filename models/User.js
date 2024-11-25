const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: String,
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: ["user", "admin", "deliveryman"],
		default: "user",
	},
});

module.exports = mongoose.model("User", userSchema);
