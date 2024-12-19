const bcrypt = require('bcrypt');
const { findUserByUsername, findUserByEmail, createUser } = require('./usersModel');


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
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.render('register', { error: 'Username already exists', title: 'Register' });
        }

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.render('register', { error: 'Email already exists', title: 'Register' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, email, hashedPassword);

        res.redirect('/users/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Something went wrong!', title: 'Register' });
    }
};

const getLogin = (req, res) => {
    res.render('login', { title: 'Login' });
};

const postLogin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return res.render('login', { error: 'Invalid username', title: 'Login' });
        }

        const em = await findUserByEmail(email);
        if (!em) {
            return res.render('login', { error: 'Invalid email', title: 'Login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid password', title: 'Login' });
        }

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Something went wrong!', title: 'Login' });
    }
};

module.exports = { getLogin, postLogin, getRegister, postRegister };
