const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Food = require("../models/Food");

// GET /foods - List all food items
router.get("/", authenticate, async (req, res) => {
	try {
		const foods = await Food.find();
		res.status(200).json(foods);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch food items" });
	}
});

// POST /foods - Add a new food item (Admin only)
router.post("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const newFood = new Food(req.body);
		await newFood.save();
		res.status(201).json(newFood);
	} catch (err) {
		res.status(500).json({ error: "Failed to add food item" });
	}
});

// PUT /foods/:id - Edit a food item (Admin only)
router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
	try {
		const updatedFood = await Food.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.status(200).json(updatedFood);
	} catch (err) {
		res.status(500).json({ error: "Failed to update food item" });
	}
});

// DELETE /foods/:id - Delete a food item (Admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
	try {
		await Food.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Food item deleted" });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete food item" });
	}
});

module.exports = router;
