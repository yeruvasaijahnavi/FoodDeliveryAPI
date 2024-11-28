const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) return res.status(401).send("Access denied");

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(403).send("Invalid token");
	}
};

// New isDeliveryMan function
const isDeliveryMan = (req, res, next) => {
	// Assuming that the role of the user is available in req.user
	if (req.user.role !== "DeliveryMan") {
		return res.status(403).send("Access denied: Not a delivery man");
	}
	next();
};

const authorize = (role) => (req, res, next) => {
	if (req.user.role !== role)
		return res
			.status(403)
			.send(
				`Access denied, you must be a ${role} to access this service`
			);
	next();
};

module.exports = { authenticate, authorize, isDeliveryMan }; // Ensure isDeliveryMan is exported
