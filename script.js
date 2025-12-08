// ============================================
// RFID WAREHOUSE SYSTEM - JAVASCRIPT
// ============================================

// API Configuration
const API_BASE_URL = 'http://localhost:3306/api';

// ============================================
// CONNECTION TESTER
// ============================================

async function testBackendConnection() {
    console.log('🔗 Testing backend connection...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        
        console.log('✅ Backend connected:', data.message);
        
        // Update status display
        const statusElement = document.getElementById('apiStatus') || document.querySelector('.status');
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #10B981"></i> API Connected';
            statusElement.style.color = '#10B981';
        }
        
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        
        const statusElement = document.getElementById('apiStatus') || document.querySelector('.status');
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #EF4444"></i> API Not Connected';
            statusElement.style.color = '#EF4444';
        }
        
        return false;
    }
}

// Test immediately on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 RFID System Loading...');
    testBackendConnection();
    
    // Test every 10 seconds
    setInterval(testBackendConnection, 10000);
});

// ============================================
// 1. INITIALIZATION FUNCTIONS
// ============================================

// Check if backend API is running
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        
        const statusElement = document.getElementById('apiStatus');
        if (response.ok) {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #10B981"></i> API Connected';
            statusElement.style.color = '#10B981';
            updateDashboard();
        } else {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #F59E0B"></i> API Error';
            statusElement.style.color = '#F59E0B';
        }
    } catch (error) {
        document.getElementById('apiStatus').innerHTML = 
            '<i class="fas fa-circle" style="color: #EF4444"></i> API Not Connected';
        document.getElementById('apiStatus').style.color = '#EF4444';
        console.log('⚠️ Backend server might not be running. Start it with: npm run dev');
    }
}

// Update dashboard statistics
async function updateDashboard() {
    try {
        // Get total items
        const itemsRes = await fetch(`${API_BASE_URL}/items`);
        const items = await itemsRes.json();
        document.getElementById('totalItems').textContent = items.length || 0;
        
        // Update items list
        updateItemsList(items);
        
    } catch (error) {
        console.log('Error updating dashboard:', error);
    }
}

// ============================================
// 2. TAB NAVIGATION
// ============================================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Mark button as active
    event.currentTarget.classList.add('active');
    
    // Update content if needed
    if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// ============================================
// 3. ITEM MANAGEMENT
// ============================================

async function createItem() {
    console.log('🎯 CREATE ITEM function called');
    
    // Get form values
    const itemCode = document.getElementById('itemCode').value.trim();
    const itemName = document.getElementById('itemName').value.trim();
    const itemDesc = document.getElementById('itemDesc').value.trim();
    
    console.log('📝 Form values:', { itemCode, itemName, itemDesc });
    
    // Validation
    if (!itemCode || !itemName) {
        alert('❌ Please fill Item Code and Name');
        return;
    }
    
    // Show loading
    const resultDiv = document.getElementById('itemResult');
    resultDiv.innerHTML = '<p style="color: #F59E0B;">⏳ Creating item...</p>';
    
    try {
        console.log('📤 Sending request to:', `${API_URL}/items`);
        
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                item_code: itemCode,
                name: itemName,
                description: itemDesc
            })
        });
        
        console.log('📥 Response status:', response.status);
        
        // Try to parse response
        let data;
        try {
            const text = await response.text();
            console.log('📥 Raw response:', text);
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            resultDiv.innerHTML = '<p style="color: #EF4444;">❌ Server returned invalid response</p>';
            return;
        }
        
        if (response.ok) {
            console.log('✅ Item created successfully:', data);
            
            resultDiv.innerHTML = `
                <p style="color: #10B981;">
                    ✅ <strong>Item Created Successfully!</strong><br>
                    Code: ${itemCode}<br>
                    Name: ${itemName}<br>
                    ID: ${data.item_id || data.id}
                </p>
            `;
            
            // Clear form
            document.getElementById('itemCode').value = '';
            document.getElementById('itemName').value = '';
            document.getElementById('itemDesc').value = '';
            
            // Refresh items list
            setTimeout(() => {
                getAllItems();
            }, 1000);
            
        } else {
            console.error('❌ Server error:', data);
            
            let errorMsg = data.error || 'Unknown error';
            if (response.status === 400) errorMsg = 'Bad request - check your data';
            if (response.status === 500) errorMsg = 'Server error - check backend';
            
            resultDiv.innerHTML = `
                <p style="color: #EF4444;">
                    ❌ <strong>Error ${response.status}:</strong> ${errorMsg}
                </p>
            `;
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
        
        resultDiv.innerHTML = `
            <p style="color: #EF4444;">
                ❌ <strong>Network Error:</strong> ${error.message}<br>
                <small>Check if backend is running at ${API_URL}</small>
            </p>
        `;
    }
}

async function getAllItems() {
    console.log('📋 Fetching all items...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        
        if (!response.ok) {
            console.error('❌ Failed to fetch items:', response.status);
            return;
        }
        
        const items = await response.json();
        console.log('📋 Items fetched:', items.length);
        
        const container = document.getElementById('allItems') || document.getElementById('allItemsList');
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = '<p class="no-items">No items in database yet.</p>';
            return;
        }
        
        let html = '';
        items.forEach(item => {
            html += `
                <div class="item-card" style="margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="font-weight: bold; color: #2c3e50;">
                        ${item.item_code} - ${item.name}
                    </div>
                    <div style="color: #666; margin-top: 5px;">
                        ${item.description || 'No description'}
                    </div>
                    <div style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                        ID: ${item.id} | Created: ${new Date(item.created_at).toLocaleDateString()}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error fetching items:', error);
    }
}

// ============================================
// 4. RFID MANAGEMENT
// ============================================

// Register RFID tag
async function registerRFID() {
    const tagUID = document.getElementById('tagUID').value.trim();
    const itemCode = document.getElementById('regItemCode').value.trim();
    const batchNo = document.getElementById('batchNo').value.trim();
    const expiryDate = document.getElementById('expiryDate').value;
    
    if (!tagUID || !itemCode) {
        showMessage('registerResult', '❌ Tag UID and Item Code are required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rfid/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tag_uid: tagUID,
                item_code: itemCode,
                batch_no: batchNo || null,
                expiry_date: expiryDate || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('registerResult', 
                `✅ RFID tag registered successfully!<br>Tag: ${tagUID}<br>Item: ${itemCode}`, 
                'success');
            
            // Clear form
            document.getElementById('tagUID').value = '';
            document.getElementById('regItemCode').value = '';
            document.getElementById('batchNo').value = '';
            document.getElementById('expiryDate').value = '';
        } else {
            showMessage('registerResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('registerResult', `❌ Network error: ${error.message}`, 'error');
    }
}

// Receive item
async function receiveItem() {
    const tagUID = document.getElementById('receiveTagUID').value.trim();
    
    if (!tagUID) {
        showMessage('receiveResult', '❌ Please enter Tag UID', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rfid/receive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag_uid: tagUID })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('receiveResult', 
                `✅ Item received successfully!<br>Tag: ${tagUID}<br>Location: Receiving Area (REC-01)`, 
                'success');
            
            document.getElementById('receiveTagUID').value = '';
        } else {
            showMessage('receiveResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('receiveResult', `❌ Network error: ${error.message}`, 'error');
    }
}

// Move item
async function moveItem() {
    const tagUID = document.getElementById('moveTagUID').value.trim();
    const location = document.getElementById('locationSelect').value;
    
    if (!tagUID) {
        showMessage('moveResult', '❌ Please enter Tag UID', 'error');
        return;
    }
    
    if (!location) {
        showMessage('moveResult', '❌ Please select a destination', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rfid/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                tag_uid: tagUID,
                to_location_code: location
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const locationName = document.getElementById('locationSelect').selectedOptions[0].text;
            showMessage('moveResult', 
                `✅ Item moved successfully!<br>Tag: ${tagUID}<br>To: ${locationName}`, 
                'success');
            
            document.getElementById('moveTagUID').value = '';
        } else {
            showMessage('moveResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('moveResult', `❌ Network error: ${error.message}`, 'error');
    }
}

// ============================================
// 5. SEARCH FUNCTIONS
// ============================================

// Search by item code
async function searchByItem() {
    const itemCode = document.getElementById('searchItemCode').value.trim();
    
    if (!itemCode) {
        showMessage('searchResult', '❌ Please enter Item Code to search', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rfid/search?item_code=${itemCode}`);
        const data = await response.json();
        
        if (response.ok) {
            if (data.count === 0) {
                showMessage('searchResult', 'ℹ️ No items found with that code', 'info');
                return;
            }
            
            let html = `<h3>Found ${data.count} item(s):</h3>`;
            data.items.forEach(item => {
                html += `
                    <div class="search-result-item">
                        <h4>${item.item_name || 'Unknown Item'} (${item.item_code})</h4>
                        <p><strong>RFID Tag:</strong> ${item.tag_uid}</p>
                        <p><strong>Location:</strong> ${item.location_code || 'Not assigned'}</p>
                        ${item.batch_no ? `<p><strong>Batch:</strong> ${item.batch_no}</p>` : ''}
                        ${item.expiry_date ? `<p><strong>Expires:</strong> ${item.expiry_date}</p>` : ''}
                    </div>
                `;
            });
            
            document.getElementById('searchResult').innerHTML = html;
        } else {
            showMessage('searchResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('searchResult', `❌ Network error: ${error.message}`, 'error');
    }
}

// Search by tag UID
async function searchByTag() {
    const tagUID = document.getElementById('searchTagUID').value.trim();
    
    if (!tagUID) {
        showMessage('searchResult', '❌ Please enter Tag UID to locate', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rfid/locate?tag_uid=${tagUID}`);
        const data = await response.json();
        
        if (response.ok) {
            let html = `
                <h3>📍 Item Location Found</h3>
                <div class="location-result">
                    <div class="location-header">
                        <h4>${data.item_name || 'Unknown Item'} (${data.item_code})</h4>
                        <span class="tag-uid">Tag: ${data.tag_uid}</span>
                    </div>
                    <div class="location-details">
                        <p><i class="fas fa-map-marker-alt"></i> <strong>Current Location:</strong></p>
                        <p class="location-code">${data.location_code || 'Not assigned'}</p>
                        <p><strong>Zone:</strong> ${data.zone || 'N/A'}</p>
                        <p><strong>Rack:</strong> ${data.rack || 'N/A'}</p>
                        <p><strong>Bin:</strong> ${data.bin || 'N/A'}</p>
                    </div>
                    ${data.batch_no ? `<p><strong>Batch:</strong> ${data.batch_no}</p>` : ''}
                    ${data.expiry_date ? `<p><strong>Expiry:</strong> ${data.expiry_date}</p>` : ''}
                    <p><strong>Registered:</strong> ${new Date(data.registered_at).toLocaleString()}</p>
                </div>
            `;
            
            document.getElementById('searchResult').innerHTML = html;
        } else {
            showMessage('searchResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage('searchResult', `❌ Network error: ${error.message}`, 'error');
    }
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

// Show message in result boxes
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    
    let icon = '';
    let color = '';
    
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle" style="color: #10B981"></i>';
            color = '#10B981';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle" style="color: #EF4444"></i>';
            color = '#EF4444';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle" style="color: #3B82F6"></i>';
            color = '#3B82F6';
            break;
    }
    
    element.innerHTML = `
        <h3>${icon} Status</h3>
        <p style="color: ${color}">${message}</p>
    `;
}

// ============================================
// 7. INITIALIZE APPLICATION
// ============================================

// When page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 RFID Warehouse System Started');
    
    // Check API status
    checkAPIStatus();
    
    // Check every 10 seconds
    setInterval(checkAPIStatus, 10000);
    
    // Add today's date to expiry date field
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    document.getElementById('expiryDate').valueAsDate = tomorrow;
    
    // Show dashboard by default
    updateDashboard();
});

// ============================================
// CHATBOT FUNCTIONS
// ============================================

// Open chatbot modal
function openChatbot() {
    console.log('💬 Opening chatbot...');
    const modal = document.getElementById('chatbotModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 300);
}

// Close chatbot modal
function closeChatbot() {
    console.log('💬 Closing chatbot...');
    const modal = document.getElementById('chatbotModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Update word count
function updateWordCount() {
    const textarea = document.getElementById('chatInput');
    const wordCountElement = document.getElementById('wordCount');
    
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    
    wordCountElement.textContent = words;
    
    // Change color if over limit
    if (words > 100) {
        wordCountElement.style.color = '#EF4444';
        textarea.style.borderColor = '#EF4444';
    } else {
        wordCountElement.style.color = '#7f8c8d';
        textarea.style.borderColor = '#e0e0e0';
    }
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    const messagesDiv = document.getElementById('chatMessages');
    
    // Validate message
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    const words = message.split(/\s+/).length;
    if (words > 100) {
        alert('Message exceeds 100 words limit!');
        return;
    }
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.innerHTML = `
        <div class="message-content">
            <p class="message-text">${message}</p>
            <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
    `;
    
    messagesDiv.appendChild(userMessage);
    
    // Clear input
    input.value = '';
    updateWordCount();
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate bot response after delay
    setTimeout(() => {
        removeTypingIndicator();
        showBotResponse(message);
    }, 1500);
}

// Show typing indicator
function showTypingIndicator() {
    const messagesDiv = document.getElementById('chatMessages');
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message';
    typingIndicator.id = 'typingIndicator';
    typingIndicator.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesDiv.appendChild(typingIndicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Show bot response
function showBotResponse(userMessage) {
    const messagesDiv = document.getElementById('chatMessages');
    
    // Simple bot responses
    const responses = [
        "I understand you're asking about: " + userMessage + ". For RFID registration, go to the 'Register RFID' tab and fill the form.",
        "Thanks for your message! Our support team will review: '" + userMessage + "' and get back to you within 24 hours.",
        "I've logged your query about: " + userMessage + ". You can also email us at support@cargoz.com for immediate assistance.",
        "For technical issues, please ensure the backend server is running on port 3306 and the MySQL database is connected.",
        "Your message has been received. Need help with something specific about the RFID system?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot-message';
    botMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p class="message-text">${randomResponse}</p>
            <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    `;
    
    messagesDiv.appendChild(botMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Ask quick question
function askQuestion(question) {
    const input = document.getElementById('chatInput');
    input.value = question;
    updateWordCount();
    sendMessage();
}

// Clear chat
function clearChat() {
    if (confirm('Clear all chat messages?')) {
        const messagesDiv = document.getElementById('chatMessages');
        
        // Keep only the first two messages (welcome messages)
        while (messagesDiv.children.length > 2) {
            messagesDiv.removeChild(messagesDiv.lastChild);
        }
    }
}

// ============================================
// CALL FUNCTIONS
// ============================================

// Make call (redirect to call page)
function makeCall() {
    console.log('📞 Redirecting to call page...');
    window.location.href = 'call.html';
}

// Send email
function sendEmail() {
    console.log('📧 Opening email client...');
    window.open('mailto:hello@cargoz.com?subject=RFID%20Warehouse%20Support&body=Hello%20Cargoz%20Team,', '_blank');
}

// Dial number
function dialNumber(number) {
    if (confirm(`Call ${number} now?`)) {
        window.open(`tel:${number}`, '_blank');
    }
}

// ============================================
// INITIALIZE CHATBOT
// ============================================

// Add typing dots animation CSS
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: flex;
        gap: 5px;
        padding: 15px;
        background: white;
        border-radius: 15px;
        width: 60px;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        animation: typing 1.4s infinite;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Close chatbot when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('chatbotModal');
    
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeChatbot();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeChatbot();
        }
    });
});

