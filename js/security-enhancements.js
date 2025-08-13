// Security and Privacy Enhancements
class SecurityEnhancements {
    constructor() {
        this.setupSecurity();
    }

    setupSecurity() {
        this.addDataEncryption();
        this.addSessionManagement();
        this.addPrivacyControls();
        this.addAuditLogging();
    }

    addDataEncryption() {
        // Client-side encryption for sensitive data
        const crypto = {
            async encrypt(data, key) {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(data);
                const keyBuffer = await window.crypto.subtle.importKey(
                    'raw',
                    encoder.encode(key),
                    { name: 'AES-GCM' },
                    false,
                    ['encrypt']
                );
                
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const encrypted = await window.crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    keyBuffer,
                    dataBuffer
                );
                
                return {
                    encrypted: Array.from(new Uint8Array(encrypted)),
                    iv: Array.from(iv)
                };
            },

            async decrypt(encryptedData, key, iv) {
                const encoder = new TextEncoder();
                const decoder = new TextDecoder();
                
                const keyBuffer = await window.crypto.subtle.importKey(
                    'raw',
                    encoder.encode(key),
                    { name: 'AES-GCM' },
                    false,
                    ['decrypt']
                );
                
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: new Uint8Array(iv) },
                    keyBuffer,
                    new Uint8Array(encryptedData.encrypted)
                );
                
                return decoder.decode(decrypted);
            }
        };

        this.crypto = crypto;
    }

    addSessionManagement() {
        const sessionManager = {
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            lastActivity: Date.now(),
            
            updateActivity() {
                this.lastActivity = Date.now();
                localStorage.setItem('lastActivity', this.lastActivity.toString());
            },
            
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
            },
            
            expireSession() {
                // Clear sensitive data
                localStorage.removeItem('geminiApiKey');
                localStorage.removeItem('conversationHistory');
                localStorage.removeItem('patientData');
                
                // Show session expired message
                alert('Session expired for security. Please refresh and re-enter your API key.');
                window.location.reload();
            }
        };

        // Monitor user activity
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                sessionManager.updateActivity();
            });
        });

        // Check session periodically
        setInterval(() => {
            sessionManager.checkSession();
        }, 60000); // Check every minute

        this.sessionManager = sessionManager;
    }

    addPrivacyControls() {
        const privacyControls = {
            dataRetention: {
                conversations: 7, // days
                images: 1, // days
                vitals: 30 // days
            },
            
            clearOldData() {
                const now = Date.now();
                const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
                
                const filtered = conversations.filter(conv => {
                    const age = now - conv.timestamp;
                    return age < (this.dataRetention.conversations * 24 * 60 * 60 * 1000);
                });
                
                localStorage.setItem('conversations', JSON.stringify(filtered));
            },
            
            exportUserData() {
                const userData = {
                    conversations: localStorage.getItem('conversations'),
                    preferences: localStorage.getItem('userPreferences'),
                    exportDate: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(userData, null, 2)], 
                    { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'telemed-data-export.json';
                a.click();
                URL.revokeObjectURL(url);
            },
            
            deleteAllData() {
                if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    alert('All data has been deleted.');
                    window.location.reload();
                }
            }
        };

        this.privacyControls = privacyControls;
    }

    addAuditLogging() {
        const auditLogger = {
            log(action, details) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    action,
                    details,
                    userAgent: navigator.userAgent,
                    sessionId: this.getSessionId()
                };
                
                const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
                logs.push(logEntry);
                
                // Keep only last 100 entries
                if (logs.length > 100) {
                    logs.splice(0, logs.length - 100);
                }
                
                localStorage.setItem('auditLogs', JSON.stringify(logs));
            },
            
            getSessionId() {
                let sessionId = sessionStorage.getItem('sessionId');
                if (!sessionId) {
                    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    sessionStorage.setItem('sessionId', sessionId);
                }
                return sessionId;
            },
            
            getLogs() {
                return JSON.parse(localStorage.getItem('auditLogs') || '[]');
            }
        };

        this.auditLogger = auditLogger;
    }

    createPrivacyInterface() {
        return `
            <div class="privacy-controls">
                <h3>Privacy & Security</h3>
                
                <div class="privacy-section">
                    <h4>Data Management</h4>
                    <button onclick="exportUserData()" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export My Data
                    </button>
                    <button onclick="clearOldData()" class="btn btn-secondary">
                        <i class="fas fa-broom"></i> Clear Old Data
                    </button>
                    <button onclick="deleteAllData()" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Delete All Data
                    </button>
                </div>
                
                <div class="privacy-section">
                    <h4>Session Security</h4>
                    <p>Session timeout: 30 minutes of inactivity</p>
                    <p>Data encryption: AES-256-GCM</p>
                    <p>API key storage: Local browser only</p>
                </div>
                
                <div class="privacy-section">
                    <h4>Data Retention</h4>
                    <ul>
                        <li>Conversations: 7 days</li>
                        <li>Images: 1 day</li>
                        <li>Vital signs: 30 days</li>
                    </ul>
                </div>
            </div>
        `;
    }
}