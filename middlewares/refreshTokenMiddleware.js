import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

// Middleware to validate the refresh token and set user in request
export const refreshTokenMid = asyncHandler(async (req, res, next) => {
    console.log("insider refreshToken Middleware")
    // Extracting refresh token from cookies
    const token = req.cookies.refreshToken;

    console.log(token+"Where is token?")

    console.log(req.cookies.refreshToken)

    if (!token) {
        return res.status(401).json({ message: 'Refresh token not provided.' });
    }

    try {
        // Verify the refresh token
        const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        
        // Find user based on the ID in the decoded token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(403).json({ message: "User not found." });
        }

        next(); // Proceed to the controller
    } catch (error) {
        console.error("Error verifying refresh token:", error);
        return res.status(401).json({ message: "Refresh token is invalid." });
    }
});