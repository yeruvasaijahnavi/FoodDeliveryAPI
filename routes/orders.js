const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Order = require("../models/Order"); // Order model

// POST /orders - Place a new order (User only)
router.post("/", authenticate, authorize("customer"), async (req, res) => {
	try {
		const newOrder = new Order({
			user: req.user.id, // Automatically assigned from authenticated user
			foodItems: req.body.foodItems, // Food names passed in the request body
			totalPrice: req.body.totalPrice, // Total price passed in the request body
			status: "pending", // Default status
		});
		await newOrder.save();
		res.status(201).json(newOrder);
	} catch (err) {
		res.status(500).json({ error: "Failed to place order", msg: err });
	}
});

// GET /orders - View all orders (Admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const orders = await Order.find()
			.populate("user")
			.populate("foodItems");
		res.status(200).json(orders);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch orders" });
	}
});

// GET /orders/:id - View order details (User or Admin)
router.get("/:id", authenticate, async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user")
			.populate("foodItems");
		if (
			req.user.role === "admin" ||
			order.user.toString() === req.user.id
		) {
			res.status(200).json(order);
		} else {
			res.status(403).json({ error: "Access denied" });
		}
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch order details" });
	}
});

// PUT /orders/:id/status - Update order status (Admin only)
router.put(
	"/:id/status",
	authenticate,
	authorize("admin"),
	async (req, res) => {
		try {
			const updatedOrder = await Order.findByIdAndUpdate(
				req.params.id,
				{ status: req.body.status },
				{ new: true }
			);
			res.status(200).json(updatedOrder);
		} catch (err) {
			res.status(500).json({ error: "Failed to update order status" });
		}
	}
);

module.exports = router;
