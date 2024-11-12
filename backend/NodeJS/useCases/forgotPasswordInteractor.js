const userRepository = require('../repositories/userRepository');
const emailUtil = require('../utils/emailUtil');

const forgotPasswordInteractor = async (email) => {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
        throw new Error('Email not found');
    }
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepository.setRandomCode(email, randomCode);
    await emailUtil.sendOTP(email, randomCode);
    return { message: 'OTP sent' };
};

module.exports = forgotPasswordInteractor;
