const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Food = require("../models/Food");
const Log = require("../models/Log"); // Log model for transaction logs

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
		// Create a new food item from the request body
		const newFood = new Food(req.body);

		// Save the new food item
		await newFood.save();

		// Log the food item creation
		await new Log({
			action: "Food Item Added",
			user: req.user.id,
			details: `Food item ${newFood.name} with price ${newFood.price} added`,
		}).save();

		// Respond with the newly created food item
		res.status(201).json(newFood);
	} catch (err) {
		res.status(500).json({ error: "Failed to add food item" });
	}
});

// PUT /foods/:id - Edit a food item (Admin only)
router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
	try {
		// Find and update the food item by ID
		const updatedFood = await Food.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);

		// Log the food item update
		await new Log({
			action: "Food Item Updated",
			user: req.user.id,
			details: `Food item ${
				updatedFood.name
			} updated with new details: ${JSON.stringify(req.body)}`,
		}).save();

		// Respond with the updated food item
		res.status(200).json(updatedFood);
	} catch (err) {
		res.status(500).json({ error: "Failed to update food item" });
	}
});

// DELETE /foods/:id - Delete a food item (Admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
	try {
		// Find and delete the food item by ID
		const deletedFood = await Food.findByIdAndDelete(req.params.id);

		// Log the food item deletion
		await new Log({
			action: "Food Item Deleted",
			user: req.user.id,
			details: `Food item ${deletedFood.name} deleted`,
		}).save();

		// Respond with a success message
		res.status(200).json({ message: "Food item deleted" });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete food item" });
	}
});

module.exports = router;
