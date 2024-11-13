const userRepository = require('../repositories/userRepository');

const resetPasswordInteractor = async (email, newPassword) => {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    await userRepository.resetPassword(email, newPassword);
    return { message: 'Password reset successfully' };
};

module.exports = resetPasswordInteractor;
