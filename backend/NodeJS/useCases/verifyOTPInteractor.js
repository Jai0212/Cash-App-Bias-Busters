const userRepository = require('../repositories/userRepository');

const verifyOTPInteractor = async (randomCode) => {
    const isValid = await userRepository.verifyRandomCode(randomCode);
    if (!isValid) {
        throw new Error('Invalid OTP');
    }
    await userRepository.clearRandomCode(randomCode);
    return { message: 'OTP verified successfully' };
};

module.exports = verifyOTPInteractor;
