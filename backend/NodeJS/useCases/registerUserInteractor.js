const userRepository = require('../repositories/userRepository');

const registerUserInteractor = async (firstname, lastname, email, password) => {
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
        throw new Error('Email already exists');
    }
    await userRepository.createUser(firstname, lastname, email, password);
    return { message: 'User registered successfully' };
};

module.exports = registerUserInteractor;
