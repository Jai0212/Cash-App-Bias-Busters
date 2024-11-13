const express = require('express');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const indexController = require('./controllers/indexController');
const authController = require('./controllers/authController'); // Add missing import
const userController = require('./controllers/userController'); // Add missing import

const app = express();
const port = 11355;

// Middleware setup
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());

function userAuthorization(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ code: 1, message: 'Unauthorized Access' });
    }

    const secret = "noor_mahal";

    jwt.verify(token, secret, (error, decoded) => {
        if (error) {
            console.error("Token verification failed:", error);
            return res.status(403).json({ code: 1, message: 'Token is invalid or expired' });
        }

        req['jwtUserInfo'] = decoded; // Store decoded token info for later use
        next(); // Proceed to the next middleware or route handler
    });
}

// Define routes
app.post("/form", authController.form);
app.post("/login", authController.login);
app.get('/api/get-all-users', indexController.getAllUsers);
app.post("/change_password", userAuthorization, authController.changePassword);
app.post("/forgot_password", authController.forgotPassword);
app.post("/verifyOTP", authController.verifyOTP);
app.post("/reset_password/:email", authController.resetPassword);
app.get("/api/get-email", userAuthorization, userController.getProfile);

// Start the server
app.listen(port, (error) => {
    if (error) {
        console.error("Server startup error:", error);
    } else {
        console.log(`Server running at http://localhost:${port}`);
    }
});
