const jwt = require("jsonwebtoken");

const middleWare = async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      // Extract token
      const token = authorization.split(" ")[1];
      console.log("Token:", token);

      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Decoded Token:", decoded);

      // Attach decoded user to request (ensure ID is available)
      req.user = {
        id: decoded.id,
        email: decoded.email, // optional: include other fields as needed
        role: decoded.role,   // if applicable
      };
      console.log("req.user", req.user);

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).json({ status: "failed", message: "Unauthorized User" });
    }
  } else {
    return res.status(401).json({ status: "failed", message: "Unauthorized User - No Token Provided" });
  }
};

module.exports = { middleWare };
