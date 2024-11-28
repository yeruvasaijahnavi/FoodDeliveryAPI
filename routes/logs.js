const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Log = require("../models/Log");

// GET /logs - View all logs (Admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const logs = await Log.find()
			.populate("user") // Optional: populate user details
			.sort({ timestamp: -1 }); // Optional: sort by timestamp in descending order

		// If no logs exist
		if (!logs.length) {
			return res.status(404).json({ message: "No logs found" });
		}

		// Respond with the logs
		res.status(200).json(logs);
	} catch (err) {
		res.status(500).json({
			error: "Failed to fetch logs",
			msg: err.message,
		});
	}
});

module.exports = router;
