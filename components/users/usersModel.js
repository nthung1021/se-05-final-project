var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

var findUserByUsername = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    } 
    return prisma.user.findUnique({ where: { username } });
};

var findUserByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }
    return prisma.user.findUnique({ where: { email } });
};

var createUser = async (username, email, hashedPassword) => {
    return prisma.user.create({
        data: { username, email, password: hashedPassword },
    });
};

var addTokenAndExpire = async (email, resetToken, expires) => {
    if (!email) {
        throw new Error('Email is required');
    }
    return prisma.user.update({
        where: { email },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: expires,
        },
    });
}

var findTokenAndExpire = async (token) => {
    if (!token) {
        throw new Error('Reset-password token is empty');
    }
    return prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: {
                gte: new Date(), // Token chưa hết hạn
            },
        },
    });
}

var updatePassword = async (userid, hashedPassword) => {
    return prisma.user.update({
        where: { id: userid },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });
}

module.exports = {
    findUserByUsername, 
    findUserByEmail, 
    createUser, 
    addTokenAndExpire, 
    findTokenAndExpire, 
    updatePassword
};
