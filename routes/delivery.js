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
				deliveryMan: req.user.id,
				status: "pending",
			});
			res.status(200).json(orders);
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch assigned orders" });
		}
	}
);

router.put(
	"/:id/delivered",
	authenticate,
	authorize("deliveryman"),
	async (req, res) => {
		try {
			const order = await Order.findById(req.params.id);

			// Log the order and user for debugging
			console.log("Order:", order);
			console.log("User:", req.user.id);

			if (!order) {
				return res.status(404).json({ error: "Order not found" });
			}

			// Use deliveryMan instead of assignedTo
			if (order.deliveryMan.toString() === req.user.id) {
				order.status = "delivered";
				await order.save();
				return res.status(200).json(order);
			} else {
				return res.status(403).json({
					error: "You are not authorized to update this order",
				});
			}
		} catch (err) {
			console.error("Error updating order:", err);
			res.status(500).json({
				error: "Failed to update order status",
				msg: err.message,
			});
		}
	}
);

module.exports = router;
