// Main application logic
class TeleMedApp {
    constructor() {
        this.geminiAssistant = null;
        this.initializeApp();
    }

    initializeApp() {
        // Initialize based on current page
        const currentPage = window.location.pathname.split('/').pop();

        switch (currentPage) {
            case 'chat.html':
                this.initializeChatPage();
                break;
            case 'consultation.html':
                this.initializeConsultationPage();
                break;
            default:
                this.initializeHomePage();
        }
    }

    initializeHomePage() {
        // Add smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add animation on scroll
        this.addScrollAnimations();
    }

    initializeChatPage() {
        if (typeof GeminiHealthAssistant !== 'undefined') {
            this.geminiAssistant = new GeminiHealthAssistant();
            this.setupChatInterface();
        }
    }

    initializeConsultationPage() {
        // Video consultation initialization is handled in webrtc.js
        console.log('Consultation page initialized');
    }

    setupChatInterface() {
        const apiKeyInput = document.getElementById('apiKey');
        const saveConfigBtn = document.getElementById('saveConfig');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendMessage');
        const chatMessages = document.getElementById('chatMessages');

        // Load saved API key
        if (this.geminiAssistant.apiKey) {
            apiKeyInput.value = this.geminiAssistant.apiKey;
            this.updateApiStatus(true);
            this.enableChatInterface();
        }

        // Save API key
        saveConfigBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                this.geminiAssistant.setApiKey(apiKey);
                this.testApiConnection();
            } else {
                this.updateApiStatus(false, 'API key is required');
            }
        });

        // Setup image upload functionality
        this.setupImageUpload();

        // Setup health feature interactions
        this.setupHealthFeatures();

        // Setup enhanced chat features
        this.setupChatEnhancements();

        // Setup accessibility features
        this.setupAccessibility();

        // Setup security features
        this.setupSecurity();

        // Send message
        const sendMessage = async () => {
            const message = messageInput.value.trim();
            
            if (!message) return;

            if (!this.geminiAssistant.apiKey) {
                this.addMessageToChat('Please configure your API key first.', 'bot', true);
                return;
            }

            // Check if a specialized feature is selected
            if (this.currentFeature) {
                await this.sendSpecializedMessage(message, this.currentFeature);
                return;
            }

            // Send regular message
            this.addMessageToChat(message, 'user');
            messageInput.value = '';

            // Show typing indicator
            const typingIndicator = this.addTypingIndicator();

            try {
                console.log('Sending message to Gemini:', message);
                const response = await this.geminiAssistant.sendMessage(message);
                this.removeTypingIndicator(typingIndicator);
                this.addMessageToChat(response, 'bot');
                console.log('Received response from Gemini');
            } catch (error) {
                console.error('Error sending message:', error);
                this.removeTypingIndicator(typingIndicator);

                let errorMessage = 'Sorry, I encountered an error: ';
                if (error.message.includes('API_KEY_INVALID')) {
                    errorMessage += 'Your API key is invalid. Please check and update it.';
                } else if (error.message.includes('QUOTA_EXCEEDED')) {
                    errorMessage += 'API quota exceeded. Please try again later.';
                } else if (error.message.includes('PERMISSION_DENIED')) {
                    errorMessage += 'API access denied. Please check your API key permissions.';
                } else {
                    errorMessage += error.message;
                }

                this.addMessageToChat(errorMessage, 'bot', true);
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
        });
    }

    async testApiConnection() {
        this.updateApiStatus(false, 'Testing connection...');

        try {
            await this.geminiAssistant.testConnection();
            this.updateApiStatus(true, 'API Connected Successfully');
            this.enableChatInterface();
            console.log('API connection test successful');
        } catch (error) {
            console.error('API connection test failed:', error);
            let errorMessage = 'Connection failed';

            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage = 'Invalid API key';
            } else if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage = 'API key lacks permissions';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage = 'API quota exceeded';
            } else if (error.message.includes('404')) {
                errorMessage = 'API endpoint not found';
            } else if (error.message.includes('403')) {
                errorMessage = 'API access forbidden - check your key';
            } else {
                errorMessage = `Error: ${error.message}`;
            }

            this.updateApiStatus(false, errorMessage);
        }
    }

    updateApiStatus(isConnected, message = '') {
        const statusElement = document.getElementById('apiStatus');
        if (isConnected) {
            statusElement.innerHTML = '<i class="fas fa-circle-check"></i> API Connected';
            statusElement.className = 'status connected';
        } else {
            const displayMessage = message || 'API Key Required';
            statusElement.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${displayMessage}`;
            statusElement.className = 'status error';
        }
    }

    enableChatInterface() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendMessage');
        const attachBtn = document.getElementById('attachImage');

        messageInput.disabled = false;
        sendBtn.disabled = false;
        if (attachBtn) attachBtn.disabled = false;
        messageInput.placeholder = 'Describe your symptoms, ask a health question, or upload a medical image...';
    }

    addMessageToChat(message, sender, isError = false) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        if (isError) {
            messageDiv.classList.add('error-message');
        }

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Format message content (handle markdown-like formatting)
        const formattedMessage = this.formatMessage(message);
        content.innerHTML = formattedMessage;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(message) {
        // Simple formatting for better readability
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
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

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return typingDiv;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    setupImageUpload() {
        // Setup attach image button in chat input
        const attachImage = document.getElementById('attachImage');
        const selectedImage = document.getElementById('selectedImage');
        const selectedImg = document.getElementById('selectedImg');
        const selectedImageName = document.getElementById('selectedImageName');
        const removeSelectedImage = document.getElementById('removeSelectedImage');

        this.currentImage = null;

        // Attach image button - now triggers image analysis feature
        if (attachImage) {
            attachImage.addEventListener('click', () => {
                // Set image analysis as current feature
                this.currentFeature = 'image-analysis';
                
                // Highlight the image analysis feature
                document.querySelectorAll('.feature-item').forEach(f => f.classList.remove('active'));
                const imageFeature = document.querySelector('[data-feature="image-analysis"]');
                if (imageFeature) imageFeature.classList.add('active');
                
                // Show quick actions for image analysis
                this.showQuickActions('image-analysis');
                
                // Trigger image upload
                this.triggerImageUpload('Please analyze this medical image');
            });
        }

        // Remove selected image handler
        if (removeSelectedImage) {
            removeSelectedImage.addEventListener('click', () => {
                this.clearSelectedImage();
            });
        }
    }

    clearSelectedImage() {
        const selectedImage = document.getElementById('selectedImage');
        if (selectedImage) selectedImage.style.display = 'none';
        this.currentImage = null;
    }



    addImageMessageToChat(imageFile, message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message image-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Create image preview
        const imageDiv = document.createElement('div');
        imageDiv.className = 'message-image';
        
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
        
        imageDiv.appendChild(img);
        content.appendChild(imageDiv);

        // Add message text if provided
        if (message.trim()) {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = this.formatMessage(message);
            content.appendChild(textDiv);
        } else {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = '<em>Please analyze this medical image</em>';
            content.appendChild(textDiv);
        }

        // Add medical disclaimer
        const disclaimer = document.createElement('div');
        disclaimer.className = 'analysis-warning';
        disclaimer.innerHTML = '<i class="fas fa-exclamation-triangle"></i> This image will be analyzed for informational purposes only. Always consult healthcare professionals for medical advice.';
        content.appendChild(disclaimer);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    setupHealthFeatures() {
        const featureItems = document.querySelectorAll('.feature-item');
        const quickActions = document.getElementById('quickActions');
        const quickActionsTitle = document.getElementById('quickActionsTitle');
        const actionButtons = document.getElementById('actionButtons');
        
        this.currentFeature = null;

        featureItems.forEach(item => {
            item.addEventListener('click', () => {
                const featureType = item.dataset.feature;
                
                // Remove active class from all items
                featureItems.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Set current feature
                this.currentFeature = featureType;
                
                // Show quick actions
                this.showQuickActions(featureType);
            });
        });
    }

    showQuickActions(featureType) {
        const quickActions = document.getElementById('quickActions');
        const quickActionsTitle = document.getElementById('quickActionsTitle');
        const actionButtons = document.getElementById('actionButtons');
        
        if (!quickActions || !quickActionsTitle || !actionButtons) return;

        // Get feature-specific quick actions
        const actions = this.geminiAssistant.getQuickActions(featureType);
        
        // Update title
        const featureNames = {
            'symptom-analysis': 'Symptom Analysis',
            'medication-info': 'Medication Information',
            'health-recommendations': 'Health Recommendations',
            'image-analysis': 'Image Analysis',
            'report-analysis': 'Report Analysis',
            'emergency-guidance': 'Emergency Guidance'
        };
        
        quickActionsTitle.textContent = `${featureNames[featureType]} - Quick Actions`;
        
        // Clear existing buttons
        actionButtons.innerHTML = '';
        
        // Add new action buttons
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'action-btn';
            button.textContent = action;
            button.addEventListener('click', () => {
                if (featureType === 'image-analysis') {
                    // For image analysis, trigger file upload
                    this.triggerImageUpload(action);
                } else {
                    this.sendSpecializedMessage(action, featureType);
                }
            });
            actionButtons.appendChild(button);
        });
        
        // Special handling for image analysis
        if (featureType === 'image-analysis') {
            // Add a general upload button
            const uploadButton = document.createElement('button');
            uploadButton.className = 'action-btn upload-btn';
            uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Medical Image';
            uploadButton.addEventListener('click', () => {
                this.triggerImageUpload('Upload and analyze medical image');
            });
            actionButtons.appendChild(uploadButton);
        }
        
        // Show quick actions section
        quickActions.style.display = 'block';
    }

    triggerImageUpload(prompt) {
        // Store the prompt for when image is uploaded
        this.pendingImagePrompt = prompt;
        
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageAnalysisUpload(e.target.files[0], this.pendingImagePrompt);
            }
            document.body.removeChild(fileInput);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    async handleImageAnalysisUpload(file, prompt) {
        try {
            // Validate the image file
            this.geminiAssistant.validateImageFile(file);

            // Send for analysis immediately
            await this.sendImageAnalysisWithPrompt(file, prompt);

        } catch (error) {
            this.addMessageToChat(`Error uploading image: ${error.message}`, 'bot', true);
        }
    }

    async sendImageAnalysisWithPrompt(imageFile, prompt) {
        if (!this.geminiAssistant.apiKey) {
            this.addMessageToChat('Please configure your API key first.', 'bot', true);
            return;
        }

        // Add user message with image to chat
        this.addImageMessageToChat(imageFile, prompt, 'user');

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        try {
            console.log('Sending image for specialized analysis:', imageFile.name);
            const response = await this.geminiAssistant.analyzeImage(imageFile, prompt);
            this.removeTypingIndicator(typingIndicator);
            this.addSpecializedMessageToChat(response, 'bot', 'image-analysis');
            console.log('Received specialized image analysis from Gemini');

        } catch (error) {
            console.error('Error analyzing image:', error);
            this.removeTypingIndicator(typingIndicator);

            let errorMessage = 'Sorry, I encountered an error analyzing the image: ';
            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage += 'Your API key is invalid. Please check and update it.';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage += 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage += 'API access denied. Please check your API key permissions.';
            } else {
                errorMessage += error.message;
            }

            this.addMessageToChat(errorMessage, 'bot', true);
        }
    }

    async sendSpecializedMessage(message, featureType) {
        if (!this.geminiAssistant.apiKey) {
            this.addMessageToChat('Please configure your API key first.', 'bot', true);
            return;
        }

        // Add user message to chat with feature indicator
        this.addSpecializedMessageToChat(message, 'user', featureType);
        
        // Clear message input if it was used
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.value = '';

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        try {
            console.log(`Sending specialized ${featureType} message:`, message);
            const response = await this.geminiAssistant.sendSpecializedMessage(message, featureType);
            this.removeTypingIndicator(typingIndicator);
            this.addSpecializedMessageToChat(response, 'bot', featureType);
            console.log(`Received specialized ${featureType} response`);
        } catch (error) {
            console.error(`Error sending specialized ${featureType} message:`, error);
            this.removeTypingIndicator(typingIndicator);

            let errorMessage = 'Sorry, I encountered an error: ';
            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage += 'Your API key is invalid. Please check and update it.';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage += 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage += 'API access denied. Please check your API key permissions.';
            } else {
                errorMessage += error.message;
            }

            this.addMessageToChat(errorMessage, 'bot', true);
        }
    }

    addSpecializedMessageToChat(message, sender, featureType) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message specialized-message`;
        messageDiv.dataset.featureType = featureType;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Add feature indicator for bot messages
        if (sender === 'bot') {
            const featureIndicator = document.createElement('div');
            featureIndicator.className = 'feature-indicator';
            
            const featureIcons = {
                'symptom-analysis': 'fas fa-stethoscope',
                'medication-info': 'fas fa-pills',
                'health-recommendations': 'fas fa-heart',
                'image-analysis': 'fas fa-camera',
                'report-analysis': 'fas fa-file-medical',
                'emergency-guidance': 'fas fa-exclamation-triangle'
            };
            
            const featureNames = {
                'symptom-analysis': 'Symptom Analysis',
                'medication-info': 'Medication Information',
                'health-recommendations': 'Health Recommendations',
                'image-analysis': 'Image Analysis',
                'report-analysis': 'Report Analysis',
                'emergency-guidance': 'Emergency Guidance'
            };
            
            featureIndicator.innerHTML = `<i class="${featureIcons[featureType]}"></i> ${featureNames[featureType]}`;
            content.appendChild(featureIndicator);
        }

        // Format message content
        const formattedMessage = this.formatMessage(message);
        const messageContent = document.createElement('div');
        messageContent.innerHTML = formattedMessage;
        content.appendChild(messageContent);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    setupChatEnhancements() {
        // Message search functionality
        const messageSearch = document.getElementById('messageSearch');
        const searchBtn = document.getElementById('searchBtn');
        const searchResults = document.getElementById('searchResults');
        const exportBtn = document.getElementById('exportChat');

        if (messageSearch) {
            messageSearch.addEventListener('input', (e) => {
                this.searchMessages(e.target.value);
            });

            messageSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchMessages(e.target.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchMessages(messageSearch.value);
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportConversation();
            });
        }
    }

    searchMessages(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (!query.trim()) {
            searchResults.style.display = 'none';
            // Remove highlights
            document.querySelectorAll('.message-highlight').forEach(el => {
                el.classList.remove('message-highlight');
            });
            return;
        }

        const messages = document.querySelectorAll('.message');
        const results = [];

        // Remove previous highlights
        document.querySelectorAll('.message-highlight').forEach(el => {
            el.classList.remove('message-highlight');
        });

        messages.forEach((message, index) => {
            const content = message.querySelector('.message-content');
            if (content) {
                const text = content.textContent.toLowerCase();
                if (text.includes(query.toLowerCase())) {
                    results.push({ element: message, index, content: text });
                    message.classList.add('message-highlight');
                }
            }
        });

        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No messages found</div>';
        } else {
            searchResults.innerHTML = `
                <div class="search-header">Found ${results.length} message${results.length !== 1 ? 's' : ''}</div>
                ${results.map((result, idx) => `
                    <div class="search-result-item" onclick="window.teleMedApp.scrollToMessage(${result.index})">
                        <div class="search-result-preview">
                            ${this.highlightText(result.content.substring(0, 100), query)}...
                        </div>
                        <div class="search-result-meta">Message ${result.index + 1}</div>
                    </div>
                `).join('')}
            `;
        }
        
        searchResults.style.display = 'block';
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    scrollToMessage(index) {
        const messages = document.querySelectorAll('.message');
        if (messages[index]) {
            messages[index].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Highlight the message temporarily
            messages[index].classList.add('message-flash');
            setTimeout(() => {
                messages[index].classList.remove('message-flash');
            }, 2000);
        }
        
        // Hide search results
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('messageSearch').value = '';
    }

    exportConversation() {
        const messages = document.querySelectorAll('.message');
        let conversation = 'TELEMEDICINE CONSULTATION EXPORT\n';
        conversation += '=====================================\n';
        conversation += `Date: ${new Date().toLocaleString()}\n`;
        conversation += `Platform: TeleMed AI Health Assistant\n`;
        conversation += `Powered by: Google Gemini API\n\n`;

        let messageCount = 0;
        messages.forEach(message => {
            const isUser = message.classList.contains('user-message');
            const sender = isUser ? 'PATIENT' : 'AI HEALTH ASSISTANT';
            const content = message.querySelector('.message-content');
            if (content) {
                const text = content.textContent.trim();
                const featureType = message.dataset.featureType;
                
                messageCount++;
                conversation += `[${messageCount}] ${sender}${featureType ? ` (${featureType.replace('-', ' ').toUpperCase()})` : ''}:\n`;
                conversation += `${text}\n\n`;
            }
        });

        conversation += '\n' + '='.repeat(50) + '\n';
        conversation += 'IMPORTANT MEDICAL DISCLAIMER:\n';
        conversation += 'This AI consultation is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding medical conditions.\n\n';
        conversation += 'In case of medical emergencies, contact your local emergency services immediately.\n';
        conversation += `Export generated on: ${new Date().toISOString()}\n`;

        // Download as text file
        const blob = new Blob([conversation], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemed-consultation-${new Date().toISOString().split('T')[0]}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message
        this.showNotification('Conversation exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    setupAccessibility() {
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Alt + 1-6 for quick feature selection
            if (e.altKey && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const featureIndex = parseInt(e.key) - 1;
                const features = document.querySelectorAll('.feature-item');
                if (features[featureIndex]) {
                    features[featureIndex].click();
                    features[featureIndex].focus();
                }
            }
            
            // Ctrl + Enter to send message
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('sendMessage')?.click();
            }
            
            // Ctrl + F for search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('messageSearch')?.focus();
            }
            
            // Escape to clear current selection
            if (e.key === 'Escape') {
                document.querySelectorAll('.feature-item').forEach(f => 
                    f.classList.remove('active'));
                document.getElementById('quickActions').style.display = 'none';
                document.getElementById('searchResults').style.display = 'none';
            }
        });

        // Add ARIA labels
        this.addAriaLabels();
        
        // Add high contrast toggle
        this.addHighContrastMode();
        
        // Add voice input if supported
        this.addVoiceInput();
    }

    addAriaLabels() {
        const elements = {
            '#messageInput': 'Type your health question or symptom description',
            '#sendMessage': 'Send message to AI health assistant',
            '#attachImage': 'Upload medical image for analysis',
            '#messageSearch': 'Search through conversation history',
            '#exportChat': 'Export conversation to text file',
            '#apiKey': 'Enter your Google Gemini API key'
        };

        Object.entries(elements).forEach(([selector, description]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.setAttribute('aria-label', description);
            }
        });

        // Add role and aria-live for chat messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.setAttribute('role', 'log');
            chatMessages.setAttribute('aria-live', 'polite');
            chatMessages.setAttribute('aria-label', 'Conversation with AI health assistant');
        }
    }

    addHighContrastMode() {
        const contrastToggle = document.createElement('button');
        contrastToggle.className = 'accessibility-toggle contrast-toggle';
        contrastToggle.innerHTML = '<i class="fas fa-adjust"></i>';
        contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        contrastToggle.title = 'High Contrast Mode';
        
        contrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            const isHighContrast = document.body.classList.contains('high-contrast');
            localStorage.setItem('highContrast', isHighContrast);
            contrastToggle.setAttribute('aria-pressed', isHighContrast);
        });

        // Load saved preference
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
            contrastToggle.setAttribute('aria-pressed', 'true');
        }

        document.body.appendChild(contrastToggle);
    }

    addVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            const voiceButton = document.createElement('button');
            voiceButton.className = 'voice-button';
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceButton.setAttribute('aria-label', 'Start voice input');
            voiceButton.title = 'Click to speak your message';

            voiceButton.addEventListener('click', () => {
                recognition.start();
                voiceButton.classList.add('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                voiceButton.setAttribute('aria-label', 'Stop voice input');
            });

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = transcript;
                    messageInput.focus();
                }
                this.showNotification('Voice input captured: ' + transcript.substring(0, 50) + '...', 'success');
            };

            recognition.onend = () => {
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceButton.setAttribute('aria-label', 'Start voice input');
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceButton.setAttribute('aria-label', 'Start voice input');
                this.showNotification('Voice input error: ' + event.error, 'error');
            };

            // Add voice button to chat input
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.appendChild(voiceButton);
            }
        }
    }

    setupSecurity() {
        // Session management
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        
        // Update activity on user interactions
        ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            });
        });

        // Check session periodically
        setInterval(() => {
            this.checkSession();
        }, 60000); // Check every minute

        // Add privacy controls to sidebar
        this.addPrivacyControls();
    }

    updateActivity() {
        this.lastActivity = Date.now();
        localStorage.setItem('lastActivity', this.lastActivity.toString());
    }

    checkSession() {
        const stored = localStorage.getItem('lastActivity');
        if (stored) {
            const lastActivity = parseInt(stored);
            if (Date.now() - lastActivity > this.sessionTimeout) {
                this.expireSession();
                return false;
            }
        }
        return true;
    }

    expireSession() {
        // Clear sensitive data
        localStorage.removeItem('geminiApiKey');
        localStorage.removeItem('conversationHistory');
        
        // Show session expired message
        this.showNotification('Session expired for security. Please refresh and re-enter your API key.', 'error');
        
        // Disable interface
        document.getElementById('messageInput').disabled = true;
        document.getElementById('sendMessage').disabled = true;
        document.getElementById('attachImage').disabled = true;
        
        // Clear API key input
        document.getElementById('apiKey').value = '';
        this.updateApiStatus(false, 'Session expired - API key cleared');
    }

    addPrivacyControls() {
        const privacySection = document.createElement('div');
        privacySection.className = 'privacy-controls';
        privacySection.innerHTML = `
            <h4>Privacy & Security</h4>
            <div class="privacy-buttons">
                <button id="clearData" class="btn btn-small btn-secondary" title="Clear all stored data">
                    <i class="fas fa-broom"></i> Clear Data
                </button>
                <button id="sessionInfo" class="btn btn-small btn-secondary" title="View session information">
                    <i class="fas fa-info-circle"></i> Session Info
                </button>
            </div>
            <div class="session-status">
                <small>Session timeout: 30 minutes</small>
            </div>
        `;

        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            sidebar.appendChild(privacySection);
        }

        // Add event listeners
        document.getElementById('clearData')?.addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('sessionInfo')?.addEventListener('click', () => {
            this.showSessionInfo();
        });
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all stored data? This will remove your API key, conversation history, and preferences. This action cannot be undone.')) {
            localStorage.clear();
            sessionStorage.clear();
            this.showNotification('All data cleared successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    showSessionInfo() {
        const lastActivity = localStorage.getItem('lastActivity');
        const timeRemaining = lastActivity ? 
            Math.max(0, this.sessionTimeout - (Date.now() - parseInt(lastActivity))) : 0;
        
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        
        const info = `
Session Information:
• Time remaining: ${minutes}m ${seconds}s
• Last activity: ${lastActivity ? new Date(parseInt(lastActivity)).toLocaleTimeString() : 'Unknown'}
• Data stored: ${Object.keys(localStorage).length} items
• Session timeout: 30 minutes
• High contrast: ${document.body.classList.contains('high-contrast') ? 'Enabled' : 'Disabled'}
        `;
        
        alert(info);
    }

    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe service cards
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
}

// Add CSS for typing indicator
const typingCSS = `
.typing-indicator .typing-dots {
    display: flex;
    gap: 4px;
    padding: 8px 0;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

.error-message .message-content {
    background: #f8d7da !important;
    color: #721c24 !important;
    border: 1px solid #f5c6cb;
}
`;

// Add the CSS to the page
const style = document.createElement('style');
style.textContent = typingCSS;
document.head.appendChild(style);

// PWA Installation and Service Worker Registration
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.setupPWA();
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                        this.checkForUpdates(registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed');
            this.hideInstallButton();
            this.showNotification('TeleMed installed successfully!', 'success');
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showNotification('Back online - all features available', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Offline mode - limited functionality', 'info');
        });
    }

    showInstallButton() {
        const installButton = document.createElement('button');
        installButton.className = 'install-button';
        installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
        installButton.title = 'Install TeleMed as an app';
        
        installButton.addEventListener('click', () => {
            this.installApp();
        });

        document.body.appendChild(installButton);
    }

    hideInstallButton() {
        const installButton = document.querySelector('.install-button');
        if (installButton) {
            installButton.remove();
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`PWA: User response to install prompt: ${outcome}`);
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    checkForUpdates(registration) {
        setInterval(() => {
            registration.update();
        }, 60000); // Check for updates every minute

        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateAvailable();
                }
            });
        });
    }

    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>New version available!</span>
                <button id="updateApp" class="btn btn-small btn-primary">Update</button>
                <button id="dismissUpdate" class="btn btn-small btn-secondary">Later</button>
            </div>
        `;

        document.body.appendChild(updateBanner);

        document.getElementById('updateApp').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('dismissUpdate').addEventListener('click', () => {
            updateBanner.remove();
        });
    }

    showNotification(message, type) {
        // Use the existing notification system
        if (window.teleMedApp && window.teleMedApp.showNotification) {
            window.teleMedApp.showNotification(message, type);
        }
    }
}

// Initialize PWA and the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    window.teleMedApp = new TeleMedApp();
    
    // Initialize performance monitoring
    if (typeof PerformanceMonitor !== 'undefined') {
        window.performanceMonitor = new PerformanceMonitor();
    }
});