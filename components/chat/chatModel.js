const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new chat
const createNewChat = async (name, userId) => {
    return prisma.chat.create({
        data: {
            name,
            userMessages: [],
            aiResponses: [],
            userId: userId,
        },
    });
};

// Find a chat by ID and ensure it belongs to the user
const findChatById = async (id, userId) => {
    return prisma.chat.findFirst({
        where: { 
            AND: [
                { id: parseInt(id, 10) },
                { userId: userId }
            ]
        },
    });
};

// Update a chat with new messages
const updateChatMessages = async (id, userId, userMessage, aiResponse) => {
    return prisma.chat.update({
        where: { 
            id: parseInt(id, 10),
            userId: userId
        },
        data: {
            userMessages: { push: userMessage },
            aiResponses: { push: aiResponse },
        },
    });
};

// Fetch all chats for a specific user
const getChats = async (userId) => {
    return prisma.chat.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc', // Order chats by newest first
        },
        select: {
            id: true,
            name: true,
            createdAt: true,
        },
    });
};

const findChatByName = async (name, userId) => {
    return prisma.chat.findFirst({
        where: { 
            AND: [
                { name: name },
                { userId: userId }
            ]
        },
    });
};

// Delete a chat by ID (only if it belongs to the user)
const deleteChat = async (id, userId) => {
    return prisma.chat.delete({
        where: { 
            id: parseInt(id, 10),
            userId: userId
        },
    });
};

module.exports = {createNewChat, findChatById, updateChatMessages, getChats, findChatByName, deleteChat};
