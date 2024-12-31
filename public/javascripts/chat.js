const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatInput = document.getElementById('chatInput');
let chatId = null; // To store the ID of the current chat session

// Function to load chat history
async function loadChatHistory(id, name) {
    try {
        const response = await fetch(`/chat/${id}`);
        const data = await response.json();
        
        // Clear previous messages
        chatMessages.innerHTML = '';
        
        // Update chat header
        const chatHeader = document.querySelector('.p-4.border-b');
        chatHeader.textContent = `Chat AI - ${name}`;
        
        // Display chat history
        data.messages.forEach((msg, index) => {
            if (msg.userMessage) {
                const userMessageDiv = document.createElement('div');
                userMessageDiv.className = 'flex justify-end';
                userMessageDiv.innerHTML = `<div class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg max-w-md">${msg.userMessage}</div>`;
                chatMessages.appendChild(userMessageDiv);
            }
            
            if (msg.aiResponse) {
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.className = 'flex items-start';
                aiMessageDiv.innerHTML = `
                    <div>
                    <p class="italic text-gray-500 mb-1">Chat AI</p>
                    <div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg max-w-md">${msg.aiResponse}</div>
                    </div>
                `;
                chatMessages.appendChild(aiMessageDiv);
            }
        });
        
        // Show chat input
        chatInput.classList.remove('hidden');
        
        // Set current chat ID
        chatId = id;
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error loading chat:', error);
        alert('Failed to load chat history');
    }
}

// Function to update chat list in sidebar
async function updateChatList() {
    try {
        const response = await fetch('/chat/list');
        const chats = await response.json();
        
        // Get the chat list container
        const chatList = document.querySelector('.space-y-2');
        if (!chatList) return;

        // Clear existing chats
        chatList.innerHTML = '';

        // Add each chat to the list
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item group relative bg-white rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors';
            chatItem.dataset.chatId = chat.id;
            chatItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 truncate">${chat.name}</span>
                    <button class="delete-btn invisible group-hover:visible p-1 hover:bg-gray-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;

            // Add click event for loading chat
            chatItem.addEventListener('click', (e) => {
                // Only load chat if we didn't click the delete button
                if (!e.target.closest('.delete-btn')) {
                    loadChatHistory(chat.id, chat.name);
                }
            });

            // Add delete functionality
            const deleteBtn = chatItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this chat?')) {
                    try {
                        const response = await fetch('/chat/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: chat.id }),
                        });

                        if (response.ok) {
                            if (chatId === chat.id) {
                                chatMessages.innerHTML = '';
                                chatInput.classList.add('hidden');
                                chatId = null;
                                document.querySelector('.p-4.border-b').textContent = 'Chat AI';
                            }
                            await updateChatList(); // Refresh the chat list after deletion
                        } else {
                            const errorData = await response.json();
                            alert(errorData.error || 'Failed to delete chat');
                        }
                    } catch (error) {
                        console.error('Error deleting chat:', error);
                        alert('Failed to delete chat');
                    }
                }
            });

            chatList.appendChild(chatItem);
        });
    } catch (error) {
        console.error('Error updating chat list:', error);
    }
}

// Create a new chat session
document.getElementById('newChatBtn').addEventListener('click', async () => {
    const chatName = prompt('Enter a name for the new chat:');
    if (!chatName) {
        alert('Chat name is required!');
        return;
    }

    try {
        const response = await fetch('/chat/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: chatName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error);
            return;
        }

        const data = await response.json();
        
        // Load the new chat immediately
        chatId = data.id;
        const chatHeader = document.querySelector('.p-4.border-b');
        chatHeader.textContent = `Chat AI - ${data.name}`;
        chatMessages.innerHTML = '';
        chatInput.classList.remove('hidden');
        
        // Update the chat list in sidebar
        await updateChatList();
    } catch (error) {
        alert('An error occurred while creating the chat. Please try again.');
    }
});

// Send message and get AI response
sendBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (!message || !chatId) {
        alert('Please enter a message or create a chat first!');
        return;
    }

    // Append user message to the chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'flex justify-end';
    userMessageDiv.innerHTML = `<div class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg max-w-md">${message}</div>`;
    chatMessages.appendChild(userMessageDiv);

    // Clear input field
    messageInput.value = '';

    try {
        // Send message to server and get AI response
        const response = await fetch('/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: chatId, message }),
        });
        const data = await response.json();

        // Append AI response to the chat
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'flex items-start';
        aiMessageDiv.innerHTML = `
            <div>
            <p class="italic text-gray-500 mb-1">Chat AI</p>
            <div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg max-w-md">${data.aiResponse}</div>
            </div>
        `;
        chatMessages.appendChild(aiMessageDiv);

        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
});

// Initialize chat list when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateChatList();
});
