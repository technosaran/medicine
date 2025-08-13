// Enhanced Chat Features
class ChatEnhancements {
    constructor(teleMedApp) {
        this.app = teleMedApp;
        this.setupEnhancements();
    }

    setupEnhancements() {
        this.addMessageSearch();
        this.addExportFunctionality();
        this.addMessageRating();
        this.addTypingIndicatorEnhancement();
        this.addMessageTemplates();
    }

    addMessageSearch() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'chat-search';
        searchContainer.innerHTML = `
            <div class="search-input-container">
                <input type="text" id="messageSearch" placeholder="Search conversation...">
                <button id="searchBtn"><i class="fas fa-search"></i></button>
            </div>
            <div class="search-results" id="searchResults" style="display: none;"></div>
        `;
        
        const chatMain = document.querySelector('.chat-main');
        if (chatMain) {
            chatMain.insertBefore(searchContainer, chatMain.firstChild);
        }

        // Search functionality
        document.getElementById('messageSearch')?.addEventListener('input', (e) => {
            this.searchMessages(e.target.value);
        });
    }

    searchMessages(query) {
        if (!query.trim()) {
            document.getElementById('searchResults').style.display = 'none';
            return;
        }

        const messages = document.querySelectorAll('.message');
        const results = [];

        messages.forEach((message, index) => {
            const content = message.textContent.toLowerCase();
            if (content.includes(query.toLowerCase())) {
                results.push({ element: message, index });
            }
        });

        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No messages found</p>';
        } else {
            resultsContainer.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="this.scrollToMessage(${result.index})">
                    ${this.highlightText(result.element.textContent.substring(0, 100), query)}...
                </div>
            `).join('');
        }
        
        resultsContainer.style.display = 'block';
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    addExportFunctionality() {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Chat';
        exportBtn.onclick = () => this.exportConversation();

        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            sidebar.appendChild(exportBtn);
        }
    }

    exportConversation() {
        const messages = document.querySelectorAll('.message');
        let conversation = 'TELEMEDICINE CONSULTATION EXPORT\n';
        conversation += '=====================================\n';
        conversation += `Date: ${new Date().toLocaleString()}\n\n`;

        messages.forEach(message => {
            const isUser = message.classList.contains('user-message');
            const sender = isUser ? 'PATIENT' : 'AI ASSISTANT';
            const content = message.querySelector('.message-content').textContent.trim();
            const featureType = message.dataset.featureType;
            
            conversation += `${sender}${featureType ? ` (${featureType})` : ''}:\n`;
            conversation += `${content}\n\n`;
        });

        conversation += '\nDISCLAIMER:\n';
        conversation += 'This AI consultation is for informational purposes only and should not replace professional medical advice.\n';

        // Download as text file
        const blob = new Blob([conversation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemedicine-consultation-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    addMessageRating() {
        // Add rating system for AI responses
        const style = document.createElement('style');
        style.textContent = `
            .message-rating {
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.8rem;
                color: #666;
            }
            .rating-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            .rating-btn:hover {
                background: #f0f0f0;
            }
            .rating-btn.active {
                color: #667eea;
            }
        `;
        document.head.appendChild(style);
    }

    addMessageTemplates() {
        const templates = {
            'symptom-analysis': [
                "I've been experiencing [symptom] for [duration]",
                "The pain is [location] and feels like [description]",
                "I also have [additional symptoms]"
            ],
            'emergency-guidance': [
                "Someone is having difficulty breathing",
                "Person has severe chest pain",
                "Someone is unconscious"
            ],
            'medication-info': [
                "What should I know about [medication name]?",
                "Are there interactions with [medication]?",
                "What are the side effects of [medication]?"
            ]
        };

        // Add template suggestions when feature is selected
        this.templates = templates;
    }

    addTypingIndicatorEnhancement() {
        // Enhanced typing indicator with estimated response time
        const originalAddTypingIndicator = this.app.addTypingIndicator;
        this.app.addTypingIndicator = function() {
            const indicator = originalAddTypingIndicator.call(this);
            
            // Add estimated time
            const timeEstimate = document.createElement('div');
            timeEstimate.className = 'time-estimate';
            timeEstimate.textContent = 'Analyzing... (~10-15 seconds)';
            timeEstimate.style.fontSize = '0.7rem';
            timeEstimate.style.color = '#888';
            timeEstimate.style.marginTop = '4px';
            
            indicator.querySelector('.message-content').appendChild(timeEstimate);
            
            return indicator;
        };
    }
}