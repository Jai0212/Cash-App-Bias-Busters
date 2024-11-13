const userRepository = require('../repositories/userRepository');

const changePasswordInteractor = async (userId, oldPassword, newPassword) => {
    const user = await userRepository.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (oldPassword !== user.password) {
        throw new Error('Old password does not match');
    }
    await userRepository.updatePassword(userId, newPassword);
    return { message: 'Password changed successfully' };
};

module.exports = changePasswordInteractor;
