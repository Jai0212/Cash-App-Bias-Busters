const getAllUsersInteractor = require('../useCases/getAllUsersInteractor');

let indexController = {};

indexController.getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersInteractor();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: 'Database connection error' });
    }
};

module.exports = indexController;
