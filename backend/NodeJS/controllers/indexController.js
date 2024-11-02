const conn = require('../connection/connection');
const { sign, verify } = require('jsonwebtoken'); // Ensure you have jsonwebtoken installed
let indexController = {};
const nodemailer = require('nodemailer');

const JWT_SECRET = "noor_mahal";

indexController.form = (req, res) => {
    const data = req.body;
    console.log(data);

    let { firstname, lastname, email, password, confirmPassword } = data;

    selectSql = `select email from users where email = '${email}'`

    conn.query(selectSql, (e, records) => {
        if(e){
            res.json({code: 2, error: true, message: e.message})
        }
        else{
            if (records.length >0) {
                res.json({code: 2, error: true, message: 'Email already exists'})
            } else {
                insertSql = `insert into users(firstname, lastname, email, password) values('${firstname}','${lastname}',
        '${email}', '${password}')`

                console.log(insertSql);

                conn.query(insertSql, (e) => {
                    if (e){
                        res.json({code: 2, error: true, message: e.message})
                    }
                    else{
                        res.json({code: 3, error: false, message: 'Form submitted successfully'})
                    }
                })
            }
        }
    })

}

indexController.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ code: 2, error: true, message: 'Email and password are required' });
    }

    const selectSql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}' `;
    conn.query(selectSql, [email, password], (error, records) => {
        if (error) {
            return res.json({ code: 2, error: true, message: error.message });
        }

        if (records.length === 0) {
            return res.json({ code: 2, error: true, message: 'Invalid email or password' });
        } else {
            const user = records[0];
            const token = sign({
                user_id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname
            }, JWT_SECRET, { expiresIn: '1d' });

            res.cookie('jwtUserToken', token, { httpOnly: true, maxAge: 86400000 }); // 1 day

            return res.json({ code: 3, error: false, message: 'Login successful!', data: token });
        }
    });
};

indexController.getAllUsers = (req, res) => {
    const selectSql = "SELECT id, firstname, lastname, email, password, randomCode FROM users";

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
            password: user.password,
            randomCode: user.randomCode
        }));

        return res.status(200).json(user_data);
    });
};

indexController.change_password = (req, res) => {
    const userId = req['jwtUserInfo']['user_id'];
    const { old_password, new_password, confirm_password } = req.body;

    if (!old_password || !new_password || !confirm_password) {
        return res.json({ code: 2, error: true, message: 'All fields are required' });
    }

    if (new_password !== confirm_password) {
        return res.json({ code: 2, error: true, message: 'New password and confirmation must match' });
    }

    const selectSql = `SELECT password FROM users WHERE id = '${userId}'`;

    conn.query(selectSql, [userId], (error, records) => {
        if (error) {
            return res.json({ code: 2, error: true, message: error.message });
        }

        if (records.length === 0) {
            return res.json({ code: 2, error: true, message: 'User not found' });
        }

        const currentPassword = records[0].password;

        if (currentPassword !== old_password) {
            return res.json({ code: 2, error: true, message: 'Old password does not match' });
        }

        const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
        conn.query(updateSql, [new_password, userId], (updateError) => {
            if (updateError) {
                return res.json({ code: 2, error: true, message: updateError.message });
            }

            const newToken = sign({
                user_id: userId,
                email: records[0].email,
                firstname: records[0].firstname,
                lastname: records[0].lastname
            }, JWT_SECRET, { expiresIn: '1d' });

            res.cookie('jwtUserToken', newToken, { httpOnly: true, maxAge: 86400000 });

            return res.json({ code: 3, error: false, message: 'Password changed successfully, and new token generated!', data: newToken });
        });
    });
};


indexController.forgot_password = (req, res) => {
    console.log(req.body);
    let { email } = req.body;
    console.log(email);
    
    const checkColumnSql = `SHOW COLUMNS FROM users LIKE 'randomCode'`;

    conn.query(checkColumnSql, (err, result) => {
        if (err) {
            return res.json({ code: 2, error: true, message: "Error checking column" });
        }
        
        if (result.length === 0) {
            const createColumnSql = `ALTER TABLE users ADD COLUMN randomCode VARCHAR(6)`;
            conn.query(createColumnSql, (createErr) => {
                if (createErr) {
                    return res.json({ code: 2, error: true, message: "Error creating randomCode column" });
                }
                handleForgotPassword(email, res);
            });
        } else {
            handleForgotPassword(email, res);
        }
    });

    function handleForgotPassword(email, res) {
        let selectSql = `SELECT email FROM users WHERE email = ?`;

        conn.query(selectSql, [email], (e, record) => {
            if (e) {
                return res.json({ code: 2, error: true, message: "Error checking email" });
            }

            if (record.length === 0) {
                return res.json({ code: 2, error: true, message: "Wrong email entered" });
            } else {
                const randomCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit random code

                const updateSql = `UPDATE users SET randomCode = ? WHERE email = ?`;
                conn.query(updateSql, [randomCode, email], (e) => {
                    if (e) {
                        return res.json({ code: 2, error: true, message: e.message });
                    } else {
                        const transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            secure: false,
                            auth: {
                                user: "noormahal130505@gmail.com",
                                pass: "flgj qmhn ajdm lqgh", 
                            },
                        });

                        const mailOption = {
                            from: "noormahal130505@gmail.com",
                            to: "noormahal130505@gmail.com",
                            subject: "Password Reset OTP",
                            text: 'Your OTP to change your password is ' + randomCode,
                        };

                        transporter.sendMail(mailOption, (err, info) => {
                            if (err) {
                                return res.json({ code: 2, error: true, message: err.message });
                            } else {
                                return res.json({ code: 3, error: false, message: "OTP sent" });
                            }
                        });
                    }
                });
            }
        });
    }
};

indexController.verifyOTP = (req, res) => {

    console.log(req.body)
    let{randomCode} = req.body;

    selectSql = `select randomCode from users where randomCode = '${randomCode}'`

    conn.query(selectSql, (e, records) => {
        if (e) {
            res.json({code: 2, error: true, message: e.message})
        }
        else{
            if (records.length > 0) {
                res.json({code: 3, error: false, message: "Correct OTP entered"})
                updateSql = `UPDATE users SET randomCode = NULL WHERE randomCode = '${randomCode}'`;
                conn.query(updateSql, (e) => {
                    if (e) {
                        res.json({code: 2, error: true, message: e.message})
                    }
                })
            }
            else{
                res.json({code: 2, error: true, message: "Wrong OTP entered"})
            }
        }
    })
}

indexController.reset_password = (req, res) => {
    console.log(req.body)
    let {email} = req.params
    console.log(email);
    let{newPassword} = req.body;

    let insertSql = `update users set password='${newPassword}' where email='${email}'`

    conn.query(insertSql, (e) => {
        if (e) {
            res.json({code: 2, error: true, message: e.message})
        }
        else{
            res.json({code: 3, error: false, message: "Password Changed successfully"})
        }
    })
}

// function deleteAllUsers() {
//     const deleteSql = `DELETE FROM users`;
//
//     conn.query(deleteSql, (error, result) => {
//         if (error) {
//             console.error('Error deleting users:', error.message);
//             process.exit(1); // Exit with error
//         }
//
//         console.log(`All users deleted successfully. Rows affected: ${result.affectedRows}`);
//         process.exit(0); // Exit successfully
//     });
// }
//
// // Execute the function
// deleteAllUsers();


module.exports = indexController;
