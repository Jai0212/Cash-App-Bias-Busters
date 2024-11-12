const { sign } = require('jsonwebtoken');
const registerUserInteractor = require('../useCases/registerUserInteractor');
const authenticateUserInteractor = require('../useCases/authenticateUserInteractor');
const changePasswordInteractor = require('../useCases/changePasswordInteractor');
const forgotPasswordInteractor = require('../useCases/forgotPasswordInteractor');
const verifyOTPInteractor = require('../useCases/verifyOTPInteractor');
const resetPasswordInteractor = require('../useCases/resetPasswordInteractor');
const { JWT_SECRET } = require('../utils/jwtUtil');
const User = require('../entities/User');

let authController = {};

authController.form = async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ code: 2, error: true, message: 'Passwords do not match' });
        }

        User.validateEmailFormat(email);
        User.validatePasswordStrength(password);

        await registerUserInteractor(firstname, lastname, email, password);
        return res.status(201).json({ code: 3, error: false, message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ code: 2, error: true, message: error.message });
    }
};

authController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUserInteractor(email, password);
        const token = sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwtUserToken', token, { httpOnly: true, maxAge: 86400000 });
        return res.status(200).json({ code: 3, error: false, message: 'Login successful', data: token });
    } catch (error) {
        return res.status(401).json({ code: 2, error: true, message: error.message });
    }
};

authController.changePassword = async (req, res) => {
    const userId = req['jwtUserInfo']['user_id'];
    const { old_password, new_password, confirm_password } = req.body;

    try {
        if (new_password !== confirm_password) {
            return res.status(400).json({ code: 2, error: true, message: 'New password and confirmation must match' });
        }

        User.validatePasswordStrength(new_password);

        await changePasswordInteractor(userId, old_password, new_password);
        return res.status(200).json({ code: 3, error: false, message: 'Password changed successfully' });
    } catch (error) {
        return res.status(400).json({ code: 2, error: true, message: error.message });
    }
};

authController.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        User.validateEmailFormat(email);

        await forgotPasswordInteractor(email);
        return res.status(200).json({ code: 3, error: false, message: 'OTP sent' });
    } catch (error) {
        return res.status(404).json({ code: 2, error: true, message: error.message });
    }
};

authController.verifyOTP = async (req, res) => {
    const { randomCode } = req.body;
    try {
        await verifyOTPInteractor(randomCode);
        return res.status(200).json({ code: 3, error: false, message: 'Correct OTP entered' });
    } catch (error) {
        return res.status(400).json({ code: 2, error: true, message: error.message });
    }
};

authController.resetPassword = async (req, res) => {
    const { email } = req.params;
    const { newPassword } = req.body;

    try {

        User.validatePasswordStrength(newPassword);
        await resetPasswordInteractor(email, newPassword);
        return res.status(200).json({ code: 3, error: false, message: 'Password changed successfully' });
    } catch (error) {
        return res.status(500).json({ code: 2, error: true, message: error.message });
    }
};

module.exports = authController;
