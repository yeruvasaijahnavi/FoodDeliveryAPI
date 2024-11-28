const bcrypt = require("bcryptjs");

const test = async () => {
	const plainPassword = "adminpass";

	// Hash the password
	const hashedPassword = await bcrypt.hash(plainPassword, 10);
	console.log("Hashed Password:", hashedPassword); // Debugging: Show the hashed password

	// Compare the plain password with the hashed password
	const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
	console.log("Password match:", isMatch); // Should print `true`
};

test().catch(console.error);
