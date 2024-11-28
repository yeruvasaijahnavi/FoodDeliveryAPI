const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const generateToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: "1d",
	});
};

// Register route
router.post("/register", async (req, res) => {
	try {
		const { email, password, role } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Create a new user (password will be hashed by pre('save') hook)
		const newUser = new User({ email, password, role });

		await newUser.save();

		const token = generateToken(newUser);

		res.status(201).json({ token });
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Login route
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).send("User not found");

		console.log("Input password during login:", password);
		console.log("Stored hashed password in DB:", user.password);

		const isPasswordValid = await bcrypt.compare(password, user.password);
		console.log("Password comparison result:", isPasswordValid);

		if (!isPasswordValid) {
			console.error("Password does not match the stored hash");
			return res.status(400).send("Invalid password");
		}

		const token = generateToken(user);
		res.status(200).json({ token });
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).send("Server error");
	}
});

router.post("/add-admin", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Create a new admin user
		const newUser = new User({ email, password, role: "admin" });

		await newUser.save();

		// Generate a token for the new admin user
		const token = generateToken(newUser);

		res.status(201).json({
			message: "Admin user created successfully",
			token,
		});
	} catch (error) {
		console.error("Error during admin creation:", error);
		res.status(500).json({ message: "Server error" });
	}
});
module.exports = router;
