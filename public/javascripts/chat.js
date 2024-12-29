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

// Add click event listeners to chat items
document.querySelectorAll('.chat-item').forEach(item => {
    // Open chat on click
    item.addEventListener('click', () => {
        const id = item.dataset.chatId;
        const name = item.textContent.trim();
        loadChatHistory(id, name);
    });
    
    // Delete chat
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent chat from opening when clicking delete
            
            if (confirm('Are you sure you want to delete this chat?')) {
                const id = item.dataset.chatId;
                try {
                    const response = await fetch('/chat/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id }),
                    });
                    
                    if (response.ok) {
                        item.remove(); // Remove chat from sidebar
                        if (chatId === id) {
                            // Clear current chat if it's the one being deleted
                            chatMessages.innerHTML = '';
                            chatInput.classList.add('hidden');
                            chatId = null;
                            document.querySelector('.p-4.border-b').textContent = 'Chat AI';
                        }
                    } else {
                        alert('Failed to delete chat');
                    }
                } catch (error) {
                    console.error('Error deleting chat:', error);
                    alert('Failed to delete chat');
                }
            }
        });
    }
});

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
            alert(errorData.error); // Display the error message
            return;
        }

        const data = await response.json();
        chatId = data.id;

        // Update the chat header with the new chat name
        const chatHeader = document.querySelector('.p-4.border-b');
        chatHeader.textContent = `Chat AI - ${data.name}`;
        
        // Clear previous messages
        chatMessages.innerHTML = '';

        // Show the message input field
        chatInput.classList.remove('hidden');
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
});
