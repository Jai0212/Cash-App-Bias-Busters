let userController = {};

userController.getProfile = async (req, res) => {
    try {
        const email = req['jwtUserInfo']['email'];
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        return res.status(200).json(email);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = userController;


