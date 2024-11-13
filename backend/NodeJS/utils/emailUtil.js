const nodemailer = require('nodemailer');

const sendOTP = async (email, randomCode) => {
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
            return res.json({code: 2, error: true, message: err.message});
        } else {
            return res.json({code: 3, error: false, message: "OTP sent"});
        }
    })
}

module.exports = { sendOTP };
