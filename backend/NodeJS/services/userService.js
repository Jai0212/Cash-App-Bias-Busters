const userRepository = require('../repositories/userRepository');
const { sign } = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/jwtUtil');
const emailUtil = require('../utils/emailUtil');
const jwtUtil = require('../utils/jwtUtil');

const userService = {};

userService.getUserByEmail = async (email) => {
    return await userRepository.getUserByEmail(email);
};

userService.createUser = async (firstname, lastname, email, password) => {
    return await userRepository.createUser(firstname, lastname, email, password);
};

userService.authenticateUser = async (email, password) => {
    const user = await userRepository.getUserByEmailAndPassword(email, password);
    if (!user) throw new Error('Invalid email or password');
    return user;
};

userService.getAllUsers = async () => {
    return await userRepository.getAllUsers();
};

userService.changePassword = async (userId, oldPassword, newPassword) => {
    const user = await userRepository.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (oldPassword !== user.password) {
        throw new Error('Old password does not match');
    }
    await userRepository.updatePassword(userId, newPassword);
    return {
        code: 3,
        error: false,
        message: 'Password changed successfully, and new token generated!',
        data: {
            id: user.id,
            email: user.email,
            password: user.password
        }
    };
}

userService.handleForgotPassword = async (email) => {
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw new Error('Email not found');
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepository.setRandomCode(email, randomCode);
    await emailUtil.sendOTP(email, randomCode);
};

userService.verifyOTP = async (randomCode) => {
    const isValid = await userRepository.verifyRandomCode(randomCode);
    if (!isValid) throw new Error('Invalid OTP');
    await userRepository.clearRandomCode(randomCode);
};

userService.resetPassword = async (email, newPassword) => {
    await userRepository.resetPassword(email, newPassword);
};

module.exports = userService;
