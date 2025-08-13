// Accessibility Enhancements
class AccessibilityEnhancements {
    constructor() {
        this.setupAccessibility();
    }

    setupAccessibility() {
        this.addKeyboardNavigation();
        this.addScreenReaderSupport();
        this.addHighContrastMode();
        this.addFontSizeControls();
        this.addVoiceControls();
    }

    addKeyboardNavigation() {
        // Enhanced keyboard navigation
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
            
            // Escape to clear current selection
            if (e.key === 'Escape') {
                document.querySelectorAll('.feature-item').forEach(f => 
                    f.classList.remove('active'));
                document.getElementById('quickActions').style.display = 'none';
            }
        });

        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .feature-item:focus,
            .action-btn:focus,
            .btn:focus {
                outline: 3px solid #667eea;
                outline-offset: 2px;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #667eea;
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 1000;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);

        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    addScreenReaderSupport() {
        // Add ARIA labels and descriptions
        const elements = {
            '#messageInput': 'Type your health question or symptom description',
            '#sendMessage': 'Send message to AI health assistant',
            '#attachImage': 'Upload medical image for analysis',
            '.feature-item': 'Health assistant feature. Press Enter to select',
            '.action-btn': 'Quick action button. Press Enter to use',
            '#apiKey': 'Enter your Google Gemini API key for AI functionality'
        };

        Object.entries(elements).forEach(([selector, description]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.setAttribute('aria-label', description);
            }
        });

        // Add live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);

        // Announce new messages
        const originalAddMessage = window.teleMedApp?.addMessageToChat;
        if (originalAddMessage) {
            window.teleMedApp.addMessageToChat = function(message, sender, isError) {
                originalAddMessage.call(this, message, sender, isError);
                
                // Announce to screen readers
                const announcement = `${sender === 'user' ? 'You said' : 'AI assistant responded'}: ${message.substring(0, 100)}`;
                document.getElementById('live-region').textContent = announcement;
            };
        }
    }

    addHighContrastMode() {
        const contrastToggle = document.createElement('button');
        contrastToggle.className = 'contrast-toggle';
        contrastToggle.innerHTML = '<i class="fas fa-adjust"></i> High Contrast';
        contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        
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

        // Add high contrast styles
        const contrastStyles = document.createElement('style');
        contrastStyles.textContent = `
            .high-contrast {
                filter: contrast(150%) brightness(120%);
            }
            
            .high-contrast .feature-item {
                border: 2px solid #000;
                background: #fff;
                color: #000;
            }
            
            .high-contrast .feature-item.active {
                background: #000;
                color: #fff;
            }
            
            .high-contrast .btn-primary {
                background: #000;
                border-color: #000;
                color: #fff;
            }
            
            .contrast-toggle {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 1000;
                background: #fff;
                border: 2px solid #000;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(contrastStyles);
        document.body.appendChild(contrastToggle);
    }

    addFontSizeControls() {
        const fontControls = document.createElement('div');
        fontControls.className = 'font-controls';
        fontControls.innerHTML = `
            <button id="decrease-font" aria-label="Decrease font size">A-</button>
            <button id="reset-font" aria-label="Reset font size">A</button>
            <button id="increase-font" aria-label="Increase font size">A+</button>
        `;

        const fontSizes = ['small', 'normal', 'large', 'x-large'];
        let currentSize = 1; // normal

        document.getElementById('decrease-font')?.addEventListener('click', () => {
            if (currentSize > 0) {
                currentSize--;
                document.body.className = document.body.className.replace(/font-size-\w+/, '');
                document.body.classList.add(`font-size-${fontSizes[currentSize]}`);
                localStorage.setItem('fontSize', fontSizes[currentSize]);
            }
        });

        document.getElementById('increase-font')?.addEventListener('click', () => {
            if (currentSize < fontSizes.length - 1) {
                currentSize++;
                document.body.className = document.body.className.replace(/font-size-\w+/, '');
                document.body.classList.add(`font-size-${fontSizes[currentSize]}`);
                localStorage.setItem('fontSize', fontSizes[currentSize]);
            }
        });

        document.getElementById('reset-font')?.addEventListener('click', () => {
            currentSize = 1;
            document.body.className = document.body.className.replace(/font-size-\w+/, '');
            localStorage.removeItem('fontSize');
        });

        // Load saved font size
        const savedSize = localStorage.getItem('fontSize');
        if (savedSize) {
            currentSize = fontSizes.indexOf(savedSize);
            document.body.classList.add(`font-size-${savedSize}`);
        }

        // Add font size styles
        const fontStyles = document.createElement('style');
        fontStyles.textContent = `
            .font-size-small { font-size: 14px; }
            .font-size-normal { font-size: 16px; }
            .font-size-large { font-size: 18px; }
            .font-size-x-large { font-size: 20px; }
            
            .font-controls {
                position: fixed;
                top: 60px;
                right: 10px;
                z-index: 1000;
                display: flex;
                gap: 4px;
            }
            
            .font-controls button {
                background: #fff;
                border: 1px solid #ccc;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
        `;
        document.head.appendChild(fontStyles);
        document.body.appendChild(fontControls);
    }

    addVoiceControls() {
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
            });

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = transcript;
                    messageInput.focus();
                }
            };

            recognition.onend = () => {
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            };

            // Add voice button to chat input
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.appendChild(voiceButton);
            }

            // Voice button styles
            const voiceStyles = document.createElement('style');
            voiceStyles.textContent = `
                .voice-button {
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-left: 8px;
                }
                
                .voice-button:hover {
                    background: #218838;
                    transform: scale(1.1);
                }
                
                .voice-button.listening {
                    background: #dc3545;
                    animation: pulse 1s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(voiceStyles);
        }
    }
}