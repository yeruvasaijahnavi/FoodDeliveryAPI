const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Order = require("../models/Order"); // Order model
const User = require("../models/User");

// POST /orders - Place a new order (User only)
router.post("/", authenticate, authorize("customer"), async (req, res) => {
	try {
		// Fetch all users with the role "deliveryman"
		const deliveryMen = await User.find({ role: "deliveryman" });

		// If there are no delivery men available, return an error
		if (deliveryMen.length === 0) {
			return res.status(400).json({ error: "No delivery men available" });
		}

		// Pick a random delivery man
		const randomDeliveryMan =
			deliveryMen[Math.floor(Math.random() * deliveryMen.length)];

		// Create the new order and assign the random delivery man
		const newOrder = new Order({
			user: req.user.id, // Automatically assigned from authenticated user
			foodItems: req.body.foodItems, // Food names passed in the request body
			totalPrice: req.body.totalPrice, // Total price passed in the request body
			status: "pending", // Default status
			deliveryMan: randomDeliveryMan._id,
			deliveryManEmail: randomDeliveryMan.email,
		});

		// Save the new order
		await newOrder.save();

		// Respond with the newly created order
		res.status(201).json(newOrder);
	} catch (err) {
		// Log the error details to the console for debugging
		console.error("Error placing order:", err);

		// Send a more detailed error response
		res.status(500).json({
			error: "Failed to place order",
			msg: err.message || err,
		});
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
			res.status(500).json({
				error: "Failed to fetch deliverymans assigned orders",
			});
		}
	}
);

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
