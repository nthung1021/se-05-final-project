const axios = require('axios');
const chatModel = require('./chatModel');

const JARVIS_API_URL = process.env.JARVIS_API_URL;
const JARVIS_API_KEY = process.env.JARVIS_API_KEY;

const createChat = async (req, res) => { 
    try {
        const { name } = req.body;
        const userId = req.user.id; // Get the user ID from the session

        // Check if the chat name already exists for this user
        const existingChat = await chatModel.findChatByName(name, userId);
        if (existingChat) {
          return res.status(400).json({ error: 'Chat name already exists. Please choose a different name.' });
        }

        // Create the new chat with user ID
        const chat = await chatModel.createNewChat(name, userId);
        res.json(chat);
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Error creating chat.' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { id, message } = req.body;
        const userId = req.user.id; // Get the user ID from the session

        // Validate input
        if (!id || !message) {
            return res.status(400).json({ error: 'Chat ID and message are required.' });
        }

        console.log('Fetching chat with ID:', id);

        // Fetch the chat (ensuring it belongs to the user)
        const chat = await chatModel.findChatById(id, userId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        console.log('Chat found:', chat);

        // Simulate AI response (replace with Jarvis API integration)
        const apiResponse = await axios.post(
            JARVIS_API_URL,
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: message }],
            },
            {
                headers: {
                    Authorization: `Bearer ${JARVIS_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('API Response:', apiResponse.data);

        let aiResponse = "I'm sorry, something went wrong.";
        if (apiResponse.data && apiResponse.data.choices && apiResponse.data.choices[0].message) {
            aiResponse = apiResponse.data.choices[0].message.content;
        }
        
        console.log('AI Response:', aiResponse);

        // Update the chat messages (ensuring it belongs to the user)
        const updatedChat = await chatModel.updateChatMessages(id, userId, message, aiResponse).catch((err) => {
            console.error('Error updating chat messages:', err);
            throw new Error('Database update failed.');
        });

        res.json({ userMessage: message, aiResponse });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
};

const renderChatPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/users/login');
        }

        console.log('Fetching chats...');
        const chats = await chatModel.getChats(req.user.id); // Get chats for the specific user
        console.log('Fetched chats:', JSON.stringify(chats, null, 2));
        
        res.render('chat', { 
            title: 'Chat',
            chats: chats || [], // Ensure we always pass an array, even if empty
            user: req.user // Pass user info to the template
        });
        console.log('Page rendered with chats');
    } catch (error) {
        console.error('Error fetching chats:', error);
        // Still render the page but with empty chats array
        res.render('chat', { 
            title: 'Chat',
            chats: [],
            error: 'Failed to load chats',
            user: req.user
        });
        console.log('Page rendered with error');
    }
};

// Delete a chat
const handleDeleteChat = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.user.id;

        // Delete the chat (only if it belongs to the user)
        await chatModel.deleteChat(id, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
};

// Get chat history
const getChatHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get chat (only if it belongs to the user)
        const chat = await chatModel.findChatById(id, userId);
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        
        // Format messages into an array of objects with userMessage and aiResponse
        const messages = chat.userMessages.map((msg, index) => ({
            userMessage: msg,
            aiResponse: chat.aiResponses[index]
        }));
        
        res.json({ messages });
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
};

// Get list of chats for current user
const getChatList = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const chats = await chatModel.getChats(req.user.id);
        res.json(chats || []);
    } catch (error) {
        console.error('Error fetching chat list:', error);
        res.status(500).json({ error: 'Error fetching chat list' });
    }
};

module.exports = {
    renderChatPage,
    sendMessage,
    createChat,
    handleDeleteChat,
    getChatHistory,
    getChatList
};
