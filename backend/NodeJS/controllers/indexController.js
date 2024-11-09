const { sign } = require('jsonwebtoken');
const userService = require('../services/userService');
const { JWT_SECRET } = require('../utils/jwtUtil');
const emailUtil = require('../utils/emailUtil');

let indexController = {};

indexController.form = async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    try {
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            return res.json({ code: 2, error: true, message: 'Email already exists' });
        }

        await userService.createUser(firstname, lastname, email, password);
        return res.json({ code: 3, error: false, message: 'Form submitted successfully' });
    } catch (error) {
        return res.json({ code: 2, error: true, message: error.message });
    }
};

indexController.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ code: 2, error: true, message: 'Email and password are required' });
    }

    try {
        const user = await userService.authenticateUser(email, password);
        const token = sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwtUserToken', token, { httpOnly: true, maxAge: 86400000 });
        return res.json({ code: 3, error: false, message: 'Login successful!', data: token });
    } catch (error) {
        return res.json({ code: 2, error: true, message: error.message });
    }
};

indexController.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: 'Database connection error' });
    }
};

indexController.change_password = async (req, res) => {
    const userId = req['jwtUserInfo']['user_id'];
    const { old_password, new_password, confirm_password } = req.body;

    if (!old_password || !new_password || !confirm_password) {
        return res.json({ code: 2, error: true, message: 'All fields are required' });
    }
    if (new_password !== confirm_password) {
        return res.json({ code: 2, error: true, message: 'New password and confirmation must match' });
    }

    try {
        const user = await userService.changePassword(userId, old_password, new_password);
        const token = sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwtUserToken', token, { httpOnly: true, maxAge: 86400000 });

        return res.json({ code: 3, error: false, message: 'Password changed successfully', data: token });
    } catch (error) {
        return res.json({ code: 2, error: true, message: error.message });
    }
};

indexController.forgot_password = async (req, res) => {
    const { email } = req.body;
    try {
        await userService.handleForgotPassword(email);
        return res.json({ code: 3, error: false, message: "OTP sent" });
    } catch (error) {
        return res.json({ code: 2, error: true, message: error.message });
    }
};

indexController.verifyOTP = async (req, res) => {
    const { randomCode } = req.body;

    try {
        await userService.verifyOTP(randomCode);
        return res.json({ code: 3, error: false, message: "Correct OTP entered" });
    } catch (error) {
        return res.json({ code: 2, error: true, message: error.message });
    }
};

indexController.reset_password = async (req, res) => {
    const { email } = req.params;
    const { newPassword } = req.body;

    try {
        await userService.resetPassword(email, newPassword);
        return res.json({ code: 3, error: false, message: "Password changed successfully" });
    } catch (error) {
        return res.json({ code: 2, error: true, message: error.message });
    }
};

indexController.get_email = (req, res) => {
    const email = req['jwtUserInfo']['email'];
    return email ? res.json({ email }) : res.status(404).json({ message: "Email not found" });
};

// function deleteAllUsers() {
//     const deleteSql = DELETE FROM users;
//
//     conn.query(deleteSql, (error, result) => {
//         if (error) {
//             console.error('Error deleting users:', error.message);
//             process.exit(1); // Exit with error
//         }
//
//         console.log(All users deleted successfully. Rows affected: ${result.affectedRows});
//         process.exit(0); // Exit successfully
//     });
// }
//
// // Execute the function
// deleteAllUsers();

module.exports = indexController;
