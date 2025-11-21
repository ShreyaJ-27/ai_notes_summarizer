// Tab switching
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetTab + 'Tab') {
                content.classList.add('active');
            }
        });
    });
});

// Summarize functionality
const summarizeBtn = document.getElementById('summarizeBtn');
const notesInput = document.getElementById('notesInput');
const summaryOutput = document.getElementById('summaryOutput');

summarizeBtn.addEventListener('click', async () => {
    const notes = notesInput.value.trim();
    
    if (!notes) {
        alert('Please enter some notes first!');
        return;
    }
    
    summarizeBtn.disabled = true;
    summarizeBtn.textContent = 'Summarizing...';
    summaryOutput.textContent = 'Generating summary...';
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Please summarize these notes concisely:\n\n${notes}`
                }]
            })
        });
        
        const data = await response.json();
        const summary = data.content[0].text;
        
        summaryOutput.textContent = summary;
    } catch (error) {
        summaryOutput.textContent = 'Error generating summary. Please try again.';
        console.error(error);
    } finally {
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = 'Generate Summary';
    }
});

// Chat functionality
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
let conversationHistory = [];

async function sendMessage() {
    const message = chatInput.value.trim();
    const notes = notesInput.value.trim();
    
    if (!notes) {
        alert('Please enter some notes first!');
        return;
    }
    
    if (!message) return;
    
    // Add user message to UI
    addMessageToChat('user', message);
    chatInput.value = '';
    sendBtn.disabled = true;
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: `Here are my notes:\n\n${notes}\n\nAnswer questions about them.`
                    },
                    {
                        role: 'assistant',
                        content: 'I\'ve read your notes. What would you like to know?'
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });
        
        const data = await response.json();
        const reply = data.content[0].text;
        
        // Add to conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: reply }
        );
        
        addMessageToChat('assistant', reply);
    } catch (error) {
        addMessageToChat('assistant', 'Sorry, I encountered an error.');
        console.error(error);
    } finally {
        sendBtn.disabled = false;
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong> ${content}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});