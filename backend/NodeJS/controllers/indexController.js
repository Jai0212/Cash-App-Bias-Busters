const conn = require('../connection/connection');
const { sign } = require('jsonwebtoken'); // Ensure you have jsonwebtoken installed
let indexController = {};


indexController.form = (req, res) => {
    const data = req.body;
    console.log(data);

    let { firstname, lastname, email, password, confirmPassword } = data;

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
        return res.json({ code: 2, error: true, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.json({ code: 2, error: true, message: 'Passwords do not match' });
    }

    const selectSql = `SELECT email FROM users WHERE email = ?`;

    conn.query(selectSql, [email], (error, records) => {
        if (error) {
            return res.json({ code: 2, error: true, message: error.message });
        }

        if (records.length > 0) {
            return res.json({ code: 2, error: true, message: 'User already exists' });
        } else {
            const insertSql = `INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)`;

            conn.query(insertSql, [firstname, lastname, email, password], (insertError) => {
                if (insertError) {
                    return res.json({ code: 2, error: true, message: insertError.message });
                } else {
                    return res.json({ code: 3, error: false, message: 'User registered successfully!' });
                }
            });
        }
    });
};


indexController.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ code: 2, error: true, message: 'Email and password are required' });
    }

    const selectSql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    conn.query(selectSql, [email, password], (error, records) => {
        if (error) {
            return res.json({ code: 2, error: true, message: error.message });
        }

        if (records.length === 0) {
            return res.json({ code: 2, error: true, message: 'Invalid email or password' });
        } else {
            const user = records[0];
            // Generate JWT token
            const token = sign({
                user_id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname
            }, 'your_secret_key', { expiresIn: '1d' }); // Use a strong secret key
            
            res.cookie('jwtUserToken', token, { httpOnly: true, maxAge: 86400000 }); // 1 day

            return res.json({ code: 3, error: false, message: 'Login successful!', data: token });
        }
    });
};


indexController.getAllUsers = (req, res) => {
    const selectSql = "SELECT id, firstname, lastname, email, password FROM users";

    conn.query(selectSql, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const user_data = results.map(user => ({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: user.password 
        }));

        return res.status(200).json(user_data);
    });
};


module.exports = indexController;
