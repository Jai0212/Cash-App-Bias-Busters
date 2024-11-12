const userRepository = require('../repositories/userRepository');

const getAllUsersInteractor = async () => {
    return await userRepository.getAllUsers();
};

module.exports = getAllUsersInteractor;
