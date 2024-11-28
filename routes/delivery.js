const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth"); // Use authenticate
const Order = require("../models/Order"); // Order model

// GET /delivery/assigned - View orders assigned to the Delivery Man
router.get(
	"/assigned",
	authenticate,
	authorize("deliveryman"),
	async (req, res) => {
		// Use authenticate
		try {
			const orders = await Order.find({
				assignedTo: req.user.id,
				status: "In Progress",
			});
			res.status(200).json(orders);
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch assigned orders" });
		}
	}
);

// PUT /orders/:id/delivered - Mark an order as delivered (Delivery Man only)
router.put(
	"/:id/delivered",
	authenticate,
	authorize("deliveryman"),
	async (req, res) => {
		// Use authenticate
		try {
			const order = await Order.findById(req.params.id);
			if (order.assignedTo.toString() === req.user.id) {
				order.status = "Delivered";
				await order.save();
				res.status(200).json(order);
			} else {
				res.status(403).json({
					error: "You are not authorized to update this order",
				});
			}
		} catch (err) {
			res.status(500).json({ error: "Failed to update order status" });
		}
	}
);

module.exports = router;
