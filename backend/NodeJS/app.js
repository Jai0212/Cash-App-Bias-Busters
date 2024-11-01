const express = require('express');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const indexController = require('./controllers/indexController');

const app = express();
const port = 12345;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());

function userAuthorization(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ code: 1, message: 'Unauthorized Access' }); // Use status 401 for unauthorized access
    }

    const secret = process.env.JWT_SECRET; // Use secret from environment variables

    jwt.verify(token, secret, (error, decoded) => {
        if (error) {
            console.error("Token verification failed:", error);
            return res.status(403).json({ code: 1, message: error.message }); // Use status 403 for forbidden access
        }

        req['jwtUserInfo'] = decoded; // Store decoded token info for later use
        next(); // Proceed to the next middleware or route handler
    });
}

// Define routes
app.post("/form", indexController.form);
app.post("/login", indexController.login);
app.get('/api/get-all-users', indexController.getAllUsers);

// Start the server
app.listen(port, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server running at http://localhost:${port}`);
    }
});
