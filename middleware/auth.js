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

const authorize = (role) => (req, res, next) => {
	if (req.user.role !== role)
		return res
			.status(403)
			.send(
				`Access denied, you must be a ${role} to access this service. You are a ${req.user.role}`
			);
	next();
};

module.exports = { authenticate, authorize };
