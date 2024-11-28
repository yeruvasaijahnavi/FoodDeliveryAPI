const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Order = require("../models/Order"); // Order model
const User = require("../models/User");
const Log = require("../models/Log"); // Log model

// POST /orders - Place a new order (User only)
router.post("/", authenticate, authorize("customer"), async (req, res) => {
	try {
		const deliveryMen = await User.find({ role: "deliveryman" });

		if (deliveryMen.length === 0) {
			return res.status(400).json({ error: "No delivery men available" });
		}

		const randomDeliveryMan =
			deliveryMen[Math.floor(Math.random() * deliveryMen.length)];

		const newOrder = new Order({
			user: req.user.id,
			foodItems: req.body.foodItems,
			totalPrice: req.body.totalPrice,
			status: "pending",
			deliveryMan: randomDeliveryMan._id,
			deliveryManEmail: randomDeliveryMan.email,
		});

		await newOrder.save();

		// Log the action
		await Log.create({
			action: "Order Placed",
			user: req.user.id,
			details: `Order ID: ${newOrder._id} placed by User ID: ${req.user.id}`,
		});

		res.status(201).json(newOrder);
	} catch (err) {
		console.error("Error placing order:", err);
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

		// Log the action
		await Log.create({
			action: "View All Orders",
			user: req.user.id,
			details: `Admin ID: ${req.user.id} viewed all orders.`,
		});
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch orders" });
	}
});

// GET /orders/assigned - View assigned orders (Deliveryman only)
router.get(
	"/assigned",
	authenticate,
	authorize("deliveryman"),
	async (req, res) => {
		try {
			const orders = await Order.find({
				deliveryMan: req.user.id,
				status: "pending",
			});
			res.status(200).json(orders);

			// Log the action
			await Log.create({
				action: "View Assigned Orders",
				user: req.user.id,
				details: `Deliveryman ID: ${req.user.id} viewed their assigned orders.`,
			});
		} catch (err) {
			res.status(500).json({
				error: "Failed to fetch assigned orders",
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
			order.user._id.toString() === req.user.id
		) {
			res.status(200).json(order);

			// Log the action
			await Log.create({
				action: "View Order Details",
				user: req.user.id,
				details: `User ID: ${req.user.id} viewed details of Order ID: ${req.params.id}`,
			});
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

			// Log the action
			await Log.create({
				action: "Update Order Status",
				user: req.user.id,
				details: `Admin ID: ${req.user.id} updated status of Order ID: ${req.params.id} to ${req.body.status}`,
			});

			res.status(200).json(updatedOrder);
		} catch (err) {
			res.status(500).json({ error: "Failed to update order status" });
		}
	}
);

// PUT /orders/:id/delivered - Mark order as delivered (Deliveryman only)
router.put(
	"/:id/delivered",
	authenticate,
	authorize("deliveryman"),
	async (req, res) => {
		try {
			const order = await Order.findById(req.params.id);

			if (!order) {
				return res.status(404).json({ error: "Order not found" });
			}

			if (order.deliveryMan.toString() === req.user.id) {
				order.status = "delivered";
				await order.save();

				// Log the action
				await Log.create({
					action: "Order Delivered",
					user: req.user.id,
					details: `Deliveryman ID: ${req.user.id} marked Order ID: ${req.params.id} as delivered.`,
				});

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
