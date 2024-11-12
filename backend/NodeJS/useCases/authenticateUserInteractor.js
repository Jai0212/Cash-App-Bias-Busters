const userRepository = require('../repositories/userRepository');

const authenticateUserInteractor = async (email, password) => {
    const user = await userRepository.getUserByEmailAndPassword(email, password);
    if (!user) {
        throw new Error('Invalid email or password');
    }
    return user;
};

module.exports = authenticateUserInteractor;
