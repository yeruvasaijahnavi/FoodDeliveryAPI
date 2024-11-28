const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: "1d",
	});
};

// Login route for Admin
router.post("/login-admin", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).send("Admin not found");

		if (user.role !== "admin") {
			return res.status(403).send("You do not have admin privileges");
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) return res.status(400).send("Invalid password");

		const token = generateToken(user);
		res.status(200).json({ token });
	} catch (error) {
		console.error("Error during admin login:", error);
		res.status(500).send("Server error");
	}
});

// Login route for User
router.post("/login-customer", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).send("User not found");

		if (user.role !== "customer") {
			return res.status(403).send("You do not have user privileges");
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) return res.status(400).send("Invalid password");

		const token = generateToken(user);
		res.status(200).json({ token });
	} catch (error) {
		console.error("Error during user login:", error);
		res.status(500).send("Server error");
	}
});

// Login route for Delivery Man
router.post("/login-delivery-man", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).send("Delivery Man not found");

		if (user.role !== "deliveryman") {
			return res
				.status(403)
				.send("You do not have delivery man privileges");
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) return res.status(400).send("Invalid password");

		const token = generateToken(user);
		res.status(200).json({ token });
	} catch (error) {
		console.error("Error during delivery man login:", error);
		res.status(500).send("Server error");
	}
});

// Register route (common for all roles)
router.post("/register", async (req, res) => {
	const { email, password, role } = req.body;
	try {
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const newUser = new User({ email, password, role });
		await newUser.save();

		const token = generateToken(newUser);
		res.status(201).json({ token });
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
