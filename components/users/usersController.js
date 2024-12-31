const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const usersModel = require('./usersModel');
const passport = require('./passportConfig');

const getRegister = (req, res) => {
    res.render('register', { title: 'Register' });
};

const postRegister = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !password || !email || !confirmPassword) {
        return res.render('register', { error: 'All fields are required', title: 'Register' });
    }

    if (password !== confirmPassword ) {
        return res.render('register', { error: 'Confirm password must be the same as password', title: 'Register' });
    }

    try {
        const existingUser = await usersModel.findUserByUsername(username);
        if (existingUser) {
            return res.render('register', { error: 'Username already exists', title: 'Register' });
        }

        const existingEmail = await usersModel.findUserByEmail(email);
        if (existingEmail) {
            return res.render('register', { error: 'Email already exists', title: 'Register' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersModel.createUser(username, email, hashedPassword);

        res.redirect('/users/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Something went wrong!', title: 'Register' });
    }
};

const getLogin = (req, res) => {
    res.render('login', { title: 'Login' });
};

const postLogin = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: 'An unexpected error occurred. Please try again.', title: 'Login' });
        }
        if (!user) {
            // `info.message` contains the error message set in `passportConfig.js`
            return res.render('login', { error: info.message, title: 'Login', username: req.body.username });
        }
            req.logIn(user, (err) => {
            if (err) {
              console.error(err);
              return res.render('login', { error: 'Failed to log in. Please try again.', title: 'Login' });
            }
            return res.redirect('/');
        });
    })(req, res, next);
};

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const getForgotPassword = (req, res) => {
    const error = req.session.error;
    const success = req.session.success;

    req.session.error = null;
    req.session.success = null;

    res.render('forgotpassword', { error, success, title: 'Forgot Password' });
};

const postForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        req.session.error = "Please enter an email.";
        return res.redirect('/users/forgotpassword');
    }

    try {
        // Find user based on the input email
        const user = await usersModel.findUserByEmail(email);

        // If user if not found, return error
        if (!user) {
            req.session.error = "Email is not registered.";
            return res.redirect('/users/forgotpassword');
        }

        // Generate reset-password token
        const resetToken = generateResetToken();

        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Set token expire time to 1 hour

        await usersModel.addTokenAndExpire(email, resetToken, expires);

        // Send email and reset-password link with endpoint is token
        const resetLink = `/users/resetpassword/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Can use other account
            port: 587,
            secure: false,
            auth: {
                user: 'bao2004dt@gmail.com', // Real account
                pass: 'irny gfhu dhoq hegk', // Password of the app (not account password)
            },
        });

        const mailOptions = {
            from: 'bao2004dt@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click the link below to reset your password:\n\n${resetLink}\n\nThe link will expire in 1 hour.`,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error details:", error);
                req.session.error = "Failed to send email. Please try again.";
            } else {
                console.log('Email sent: ' + info.response);
                req.session.success = "Password reset link has been sent to your email.";
            }
            res.redirect('/users/forgotpassword');
        });
    } catch (error) {
        console.error(error);
        req.session.error = "Something went wrong. Please try again later.";
        res.redirect('/users/forgotpassword');
    }
};

const getResetPassword = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await usersModel.findTokenAndExpire(token);
        if (!user) {
            req.session.error = "Invalid or expired token.";
            return res.redirect('/users/forgotpassword');
        }

        res.render('resetpassword', { token });
    } catch (error) {
        console.error(error);
        req.session.error = "Something went wrong.";
        res.redirect('/users/forgotpassword');
    }
};

const postResetPassword = async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    if (!password || !confirmPassword || password !== confirmPassword) {
        req.session.error = "Passwords do not match.";
        return res.redirect('back');
    }

    try {
        const user = await usersModel.findTokenAndExpire(token);
        if (!user) {
            req.session.error = "Invalid or expired token.";
            return res.redirect('/users/forgotpassword');
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await usersModel.updatePassword(user.id, hashedPassword);

        req.session.success = "Password updated successfully. You can now log in.";
        res.redirect('/users/forgotpassword');
    } catch (error) {
        console.error(error);
        req.session.error = "Something went wrong.";
        res.redirect('back');
    }
};

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // Create an error object to pass to the view
        const error = {
            status: 401,
            message: 'Unauthorized access. Please log in to continue.',
            stack: (new Error()).stack // Include stack trace if needed
        };

        // Render the error page and pass the error object
        res.status(401).render('error', { error });
    }
}

const getLogout = async (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err); 
        }
        res.redirect('/');
    });
};

module.exports = {
    getLogin, 
    postLogin, 
    getRegister, 
    postRegister, 
    getForgotPassword, 
    postForgotPassword, 
    getResetPassword, 
    postResetPassword,
    ensureAuthenticated,
    getLogout
};
