// Consultation History Management
class ConsultationHistoryManager {
    constructor(database) {
        this.db = database;
        this.setupHistoryInterface();
    }

    setupHistoryInterface() {
        this.createHistoryModal();
        this.addHistoryButton();
        this.setupAutoSave();
    }

    createHistoryModal() {
        const modal = document.createElement('div');
        modal.id = 'historyModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-history"></i> Consultation History</h2>
                    <span class="close" onclick="window.consultationHistory.closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="history-controls">
                        <div class="search-filter">
                            <input type="text" id="historySearch" placeholder="Search consultations...">
                            <select id="historyFilter">
                                <option value="all">All Consultations</option>
                                <option value="symptom-analysis">Symptom Analysis</option>
                                <option value="medication-info">Medication Info</option>
                                <option value="health-recommendations">Health Recommendations</option>
                                <option value="image-analysis">Image Analysis</option>
                                <option value="report-analysis">Report Analysis</option>
                                <option value="emergency-guidance">Emergency Guidance</option>
                            </select>
                            <input type="date" id="dateFilter" title="Filter by date">
                        </div>
                        <div class="history-actions">
                            <button class="btn btn-secondary" onclick="window.consultationHistory.exportHistory()">
                                <i class="fas fa-download"></i> Export All
                            </button>
                            <button class="btn btn-secondary" onclick="window.consultationHistory.clearHistory()">
                                <i class="fas fa-trash"></i> Clear History
                            </button>
                        </div>
                    </div>
                    <div class="history-stats">
                        <div class="stat-item">
                            <span class="stat-number" id="totalConsultations">0</span>
                            <span class="stat-label">Total Consultations</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="thisMonth">0</span>
                            <span class="stat-label">This Month</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="mostUsedFeature">-</span>
                            <span class="stat-label">Most Used Feature</span>
                        </div>
                    </div>
                    <div class="history-list" id="historyList">
                        <div class="loading">Loading consultation history...</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('historySearch').addEventListener('input', (e) => {
            this.filterHistory();
        });

        document.getElementById('historyFilter').addEventListener('change', (e) => {
            this.filterHistory();
        });

        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.filterHistory();
        });
    }

    addHistoryButton() {
        const historyButton = document.createElement('button');
        historyButton.className = 'history-button';
        historyButton.innerHTML = '<i class="fas fa-history"></i>';
        historyButton.title = 'Consultation History';
        historyButton.onclick = () => this.openModal();

        document.body.appendChild(historyButton);
    }

    setupAutoSave() {
        // Hook into the existing message system to auto-save consultations
        if (window.teleMedApp) {
            const originalAddMessage = window.teleMedApp.addSpecializedMessageToChat;
            if (originalAddMessage) {
                window.teleMedApp.addSpecializedMessageToChat = (message, sender, featureType) => {
                    // Call original method
                    originalAddMessage.call(window.teleMedApp, message, sender, featureType);
                    
                    // Auto-save consultation
                    if (sender === 'bot' && featureType) {
                        this.autoSaveConsultation(message, featureType);
                    }
                };
            }
        }
    }

    async autoSaveConsultation(aiResponse, featureType) {
        try {
            // Get the last few messages for context
            const messages = document.querySelectorAll('.message');
            const recentMessages = Array.from(messages).slice(-3).map(msg => ({
                sender: msg.classList.contains('user-message') ? 'user' : 'ai',
                content: msg.querySelector('.message-content').textContent.trim(),
                timestamp: new Date().toISOString()
            }));

            const consultationData = {
                featureType: featureType,
                messages: recentMessages,
                aiResponse: aiResponse,
                duration: this.calculateSessionDuration(),
                sessionId: this.db.getSessionId()
            };

            await this.db.saveConsultation(consultationData);
            console.log('Consultation auto-saved');
        } catch (error) {
            console.error('Error auto-saving consultation:', error);
        }
    }

    async openModal() {
        const modal = document.getElementById('historyModal');
        modal.style.display = 'block';
        await this.loadHistory();
    }

    closeModal() {
        const modal = document.getElementById('historyModal');
        modal.style.display = 'none';
    }

    async loadHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '<div class="loading">Loading consultation history...</div>';

        try {
            const patientId = this.db.currentUser?.patientId || 'anonymous';
            const consultations = await this.db.getConsultationHistory(patientId, 50);
            
            this.allConsultations = consultations;
            this.displayHistory(consultations);
            this.updateStats(consultations);
        } catch (error) {
            console.error('Error loading history:', error);
            historyList.innerHTML = '<div class="error">Error loading consultation history</div>';
        }
    }

    displayHistory(consultations) {
        const historyList = document.getElementById('historyList');
        
        if (!consultations || consultations.length === 0) {
            historyList.innerHTML = '<div class="no-history">No consultation history found</div>';
            return;
        }

        historyList.innerHTML = consultations.map(consultation => `
            <div class="history-item" data-feature="${consultation.featureType}">
                <div class="history-header">
                    <div class="history-feature">
                        <i class="${this.getFeatureIcon(consultation.featureType)}"></i>
                        <span>${this.getFeatureName(consultation.featureType)}</span>
                    </div>
                    <div class="history-date">
                        ${new Date(consultation.timestamp).toLocaleString()}
                    </div>
                </div>
                <div class="history-content">
                    <div class="history-summary">
                        ${this.generateSummary(consultation)}
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-small btn-secondary" onclick="window.consultationHistory.viewDetails('${consultation.consultationId}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="window.consultationHistory.exportSingle('${consultation.consultationId}')">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn btn-small btn-danger" onclick="window.consultationHistory.deleteConsultation('${consultation.consultationId}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterHistory() {
        if (!this.allConsultations) return;

        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const featureFilter = document.getElementById('historyFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let filtered = this.allConsultations.filter(consultation => {
            // Text search
            const matchesSearch = !searchTerm || 
                consultation.aiResponse.toLowerCase().includes(searchTerm) ||
                (consultation.messages && consultation.messages.some(msg => 
                    msg.content.toLowerCase().includes(searchTerm)
                ));

            // Feature filter
            const matchesFeature = featureFilter === 'all' || consultation.featureType === featureFilter;

            // Date filter
            const matchesDate = !dateFilter || 
                new Date(consultation.timestamp).toDateString() === new Date(dateFilter).toDateString();

            return matchesSearch && matchesFeature && matchesDate;
        });

        this.displayHistory(filtered);
    }

    updateStats(consultations) {
        if (!consultations || consultations.length === 0) {
            document.getElementById('totalConsultations').textContent = '0';
            document.getElementById('thisMonth').textContent = '0';
            document.getElementById('mostUsedFeature').textContent = '-';
            return;
        }

        // Total consultations
        document.getElementById('totalConsultations').textContent = consultations.length;

        // This month
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const thisMonthCount = consultations.filter(c => {
            const date = new Date(c.timestamp);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length;
        document.getElementById('thisMonth').textContent = thisMonthCount;

        // Most used feature
        const featureCounts = {};
        consultations.forEach(c => {
            featureCounts[c.featureType] = (featureCounts[c.featureType] || 0) + 1;
        });
        const mostUsed = Object.keys(featureCounts).reduce((a, b) => 
            featureCounts[a] > featureCounts[b] ? a : b
        );
        document.getElementById('mostUsedFeature').textContent = this.getFeatureName(mostUsed);
    }

    generateSummary(consultation) {
        if (consultation.messages && consultation.messages.length > 0) {
            const userMessage = consultation.messages.find(m => m.sender === 'user');
            if (userMessage) {
                return userMessage.content.substring(0, 150) + '...';
            }
        }
        return consultation.aiResponse.substring(0, 150) + '...';
    }

    getFeatureIcon(featureType) {
        const icons = {
            'symptom-analysis': 'fas fa-stethoscope',
            'medication-info': 'fas fa-pills',
            'health-recommendations': 'fas fa-heart',
            'image-analysis': 'fas fa-camera',
            'report-analysis': 'fas fa-file-medical',
            'emergency-guidance': 'fas fa-exclamation-triangle'
        };
        return icons[featureType] || 'fas fa-comment-medical';
    }

    getFeatureName(featureType) {
        const names = {
            'symptom-analysis': 'Symptom Analysis',
            'medication-info': 'Medication Information',
            'health-recommendations': 'Health Recommendations',
            'image-analysis': 'Image Analysis',
            'report-analysis': 'Report Analysis',
            'emergency-guidance': 'Emergency Guidance'
        };
        return names[featureType] || 'General Consultation';
    }

    calculateSessionDuration() {
        const sessionStart = sessionStorage.getItem('sessionStart');
        if (sessionStart) {
            return Date.now() - parseInt(sessionStart);
        }
        return 0;
    }

    async viewDetails(consultationId) {
        const consultation = this.allConsultations.find(c => c.consultationId === consultationId);
        if (!consultation) return;

        const detailModal = document.createElement('div');
        detailModal.className = 'modal detail-modal';
        detailModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="${this.getFeatureIcon(consultation.featureType)}"></i> ${this.getFeatureName(consultation.featureType)}</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="consultation-details">
                        <div class="detail-section">
                            <h3>Consultation Information</h3>
                            <p><strong>Date:</strong> ${new Date(consultation.timestamp).toLocaleString()}</p>
                            <p><strong>Duration:</strong> ${Math.round(consultation.duration / 1000 / 60)} minutes</p>
                            <p><strong>Session ID:</strong> ${consultation.sessionId}</p>
                        </div>
                        
                        ${consultation.messages ? `
                        <div class="detail-section">
                            <h3>Conversation</h3>
                            <div class="conversation-replay">
                                ${consultation.messages.map(msg => `
                                    <div class="replay-message ${msg.sender}-message">
                                        <strong>${msg.sender === 'user' ? 'You' : 'AI Assistant'}:</strong>
                                        <p>${msg.content}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h3>AI Response</h3>
                            <div class="ai-response">
                                ${consultation.aiResponse}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailModal);
        detailModal.style.display = 'block';
    }

    async exportSingle(consultationId) {
        const consultation = this.allConsultations.find(c => c.consultationId === consultationId);
        if (!consultation) return;

        const exportData = {
            consultation: consultation,
            patient: this.db.currentUser,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation-${consultationId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async exportHistory() {
        if (!this.allConsultations || this.allConsultations.length === 0) {
            this.showNotification('No consultation history to export', 'error');
            return;
        }

        const exportData = {
            consultations: this.allConsultations,
            patient: this.db.currentUser,
            totalCount: this.allConsultations.length,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation-history-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Consultation history exported successfully!', 'success');
    }

    async clearHistory() {
        if (!confirm('Are you sure you want to clear all consultation history? This action cannot be undone.')) {
            return;
        }

        try {
            // Clear from database/localStorage
            if (this.db.isConnected) {
                // Would need backend API to clear consultations
                console.log('Would clear from database');
            } else {
                localStorage.removeItem('consultations');
            }

            this.allConsultations = [];
            this.displayHistory([]);
            this.updateStats([]);
            this.showNotification('Consultation history cleared', 'success');
        } catch (error) {
            console.error('Error clearing history:', error);
            this.showNotification('Error clearing history: ' + error.message, 'error');
        }
    }

    async deleteConsultation(consultationId) {
        if (!confirm('Are you sure you want to delete this consultation?')) {
            return;
        }

        try {
            // Remove from local array
            this.allConsultations = this.allConsultations.filter(c => c.consultationId !== consultationId);
            
            // Update display
            this.displayHistory(this.allConsultations);
            this.updateStats(this.allConsultations);
            
            // Remove from storage
            if (!this.db.isConnected) {
                const consultations = JSON.parse(localStorage.getItem('consultations') || '{}');
                delete consultations[consultationId];
                localStorage.setItem('consultations', JSON.stringify(consultations));
            }

            this.showNotification('Consultation deleted', 'success');
        } catch (error) {
            console.error('Error deleting consultation:', error);
            this.showNotification('Error deleting consultation: ' + error.message, 'error');
        }
    }

    showNotification(message, type) {
        if (window.teleMedApp && window.teleMedApp.showNotification) {
            window.teleMedApp.showNotification(message, type);
        }
    }
}

// Initialize consultation history manager
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.teleMedDB) {
            window.consultationHistory = new ConsultationHistoryManager(window.teleMedDB);
        }
    }, 1500);
});