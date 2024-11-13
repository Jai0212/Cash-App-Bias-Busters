class User {
    constructor(firstname, lastname, email, password) {
        if (!firstname || !lastname || !email || !password) {
            throw new Error('All user fields must be provided');
        }

        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
    }

    static validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    static validatePasswordStrength(password) {
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
    }
}

module.exports = User;
