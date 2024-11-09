const conn = require('../connection/connection');

const userRepository = {};

userRepository.getUserByEmail = (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [email], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
        });
    });
};

userRepository.createUser = (firstname, lastname, email, password) => {
    const query = `INSERT INTO users(firstname, lastname, email, password) VALUES(?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        conn.query(query, [firstname, lastname, email, password], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

userRepository.getUserByEmailAndPassword = (email, password) => {
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [email, password], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
        });
    });
};

userRepository.getAllUsers = () => {
    const query = `SELECT id, firstname, lastname, email, password, randomcode FROM users`;
    return new Promise((resolve, reject) => {
        conn.query(query, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

userRepository.getUserById = (userId) => {
    const query = `SELECT * FROM users WHERE id = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [userId], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
        });
    });
};

userRepository.updatePassword = (userId, newPassword) => {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
        conn.query(query, [newPassword, userId], (err, result) => {
            if (err) {
                return reject(new Error(err.message));
            }
            resolve(result);
        });
    });
};

userRepository.setRandomCode = (email, randomCode) => {
    const query = `UPDATE users SET randomCode = ? WHERE email = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [randomCode, email], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

userRepository.verifyRandomCode = (randomCode) => {
    const query = `SELECT * FROM users WHERE randomCode = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [randomCode], (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
        });
    });
};

userRepository.clearRandomCode = (randomCode) => {
    const query = `UPDATE users SET randomCode = NULL WHERE randomCode = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [randomCode], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

userRepository.resetPassword = (email, newPassword) => {
    const query = `UPDATE users SET password = ? WHERE email = ?`;
    return new Promise((resolve, reject) => {
        conn.query(query, [newPassword, email], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = userRepository;
