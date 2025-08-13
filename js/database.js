// MongoDB Integration for TeleMed Platform
class TeleMedDatabase {
    constructor() {
        this.mongoUri = 'mongodb+srv://vrathanpriyan:@saran1812@cluster0.5fwqb3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        this.apiBaseUrl = '/api'; // Backend API endpoint
        this.isConnected = false;
        this.currentUser = null;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            // Check if backend API is available
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                this.isConnected = true;
                console.log('Database connection established');
                this.showConnectionStatus(true);
            }
        } catch (error) {
            console.log('Database connection failed, using local storage fallback');
            this.isConnected = false;
            this.showConnectionStatus(false);
        }
    }

    showConnectionStatus(connected) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'db-status';
        statusIndicator.innerHTML = connected ? 
            '<i class="fas fa-database"></i> Database Connected' : 
            '<i class="fas fa-database"></i> Local Storage Mode';
        statusIndicator.style.cssText = `
            position: fixed;
            bottom: 70px;
            right: 20px;
            background: ${connected ? '#28a745' : '#ffc107'};
            color: ${connected ? 'white' : '#212529'};
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(statusIndicator);
    }

    // Patient Management
    async createPatient(patientData) {
        const patient = {
            patientId: this.generateId(),
            ...patientData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/patients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patient)
                });
                return await response.json();
            } catch (error) {
                console.error('Database error, using local storage:', error);
                return this.saveToLocalStorage('patients', patient.patientId, patient);
            }
        } else {
            return this.saveToLocalStorage('patients', patient.patientId, patient);
        }
    }

    async getPatient(patientId) {
        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/patients/${patientId}`);
                return await response.json();
            } catch (error) {
                return this.getFromLocalStorage('patients', patientId);
            }
        } else {
            return this.getFromLocalStorage('patients', patientId);
        }
    }

    async updatePatient(patientId, updateData) {
        const updatedData = {
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/patients/${patientId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                return await response.json();
            } catch (error) {
                return this.updateLocalStorage('patients', patientId, updatedData);
            }
        } else {
            return this.updateLocalStorage('patients', patientId, updatedData);
        }
    }

    // Consultation Management
    async saveConsultation(consultationData) {
        const consultation = {
            consultationId: this.generateId(),
            patientId: this.currentUser?.patientId || 'anonymous',
            ...consultationData,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/consultations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(consultation)
                });
                return await response.json();
            } catch (error) {
                return this.saveToLocalStorage('consultations', consultation.consultationId, consultation);
            }
        } else {
            return this.saveToLocalStorage('consultations', consultation.consultationId, consultation);
        }
    }

    async getConsultationHistory(patientId, limit = 10) {
        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/consultations/patient/${patientId}?limit=${limit}`);
                return await response.json();
            } catch (error) {
                return this.getPatientConsultationsLocal(patientId, limit);
            }
        } else {
            return this.getPatientConsultationsLocal(patientId, limit);
        }
    }

    // Medical Records Management
    async saveMedicalRecord(recordData) {
        const record = {
            recordId: this.generateId(),
            patientId: this.currentUser?.patientId || 'anonymous',
            ...recordData,
            createdAt: new Date().toISOString()
        };

        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/medical-records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });
                return await response.json();
            } catch (error) {
                return this.saveToLocalStorage('medicalRecords', record.recordId, record);
            }
        } else {
            return this.saveToLocalStorage('medicalRecords', record.recordId, record);
        }
    }

    async getMedicalRecords(patientId) {
        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/medical-records/patient/${patientId}`);
                return await response.json();
            } catch (error) {
                return this.getPatientRecordsLocal(patientId);
            }
        } else {
            return this.getPatientRecordsLocal(patientId);
        }
    }

    // Image Storage Management
    async saveImageAnalysis(imageData, analysisResult) {
        const imageRecord = {
            imageId: this.generateId(),
            patientId: this.currentUser?.patientId || 'anonymous',
            fileName: imageData.name,
            fileSize: imageData.size,
            fileType: imageData.type,
            analysisResult: analysisResult,
            uploadedAt: new Date().toISOString()
        };

        if (this.isConnected) {
            try {
                // For images, we'd typically use GridFS or cloud storage
                const formData = new FormData();
                formData.append('image', imageData);
                formData.append('metadata', JSON.stringify(imageRecord));

                const response = await fetch(`${this.apiBaseUrl}/images`, {
                    method: 'POST',
                    body: formData
                });
                return await response.json();
            } catch (error) {
                // Store image metadata locally (not the actual image for space reasons)
                return this.saveToLocalStorage('imageAnalyses', imageRecord.imageId, {
                    ...imageRecord,
                    imageData: null // Don't store actual image data locally
                });
            }
        } else {
            return this.saveToLocalStorage('imageAnalyses', imageRecord.imageId, {
                ...imageRecord,
                imageData: null
            });
        }
    }

    // Analytics and Reporting
    async saveAnalytics(eventData) {
        const analyticsEvent = {
            eventId: this.generateId(),
            patientId: this.currentUser?.patientId || 'anonymous',
            sessionId: this.getSessionId(),
            ...eventData,
            timestamp: new Date().toISOString()
        };

        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/analytics`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(analyticsEvent)
                });
                return await response.json();
            } catch (error) {
                return this.saveToLocalStorage('analytics', analyticsEvent.eventId, analyticsEvent);
            }
        } else {
            return this.saveToLocalStorage('analytics', analyticsEvent.eventId, analyticsEvent);
        }
    }

    async getAnalytics(patientId, dateRange) {
        if (this.isConnected) {
            try {
                const params = new URLSearchParams({
                    patientId,
                    startDate: dateRange.start,
                    endDate: dateRange.end
                });
                const response = await fetch(`${this.apiBaseUrl}/analytics?${params}`);
                return await response.json();
            } catch (error) {
                return this.getAnalyticsLocal(patientId, dateRange);
            }
        } else {
            return this.getAnalyticsLocal(patientId, dateRange);
        }
    }

    // User Authentication
    async authenticateUser(credentials) {
        if (this.isConnected) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });
                const result = await response.json();
                if (result.success) {
                    this.currentUser = result.user;
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                }
                return result;
            } catch (error) {
                return this.authenticateLocal(credentials);
            }
        } else {
            return this.authenticateLocal(credentials);
        }
    }

    // Local Storage Fallback Methods
    saveToLocalStorage(collection, id, data) {
        const collectionData = JSON.parse(localStorage.getItem(collection) || '{}');
        collectionData[id] = data;
        localStorage.setItem(collection, JSON.stringify(collectionData));
        return { success: true, data };
    }

    getFromLocalStorage(collection, id) {
        const collectionData = JSON.parse(localStorage.getItem(collection) || '{}');
        return collectionData[id] || null;
    }

    updateLocalStorage(collection, id, updateData) {
        const collectionData = JSON.parse(localStorage.getItem(collection) || '{}');
        if (collectionData[id]) {
            collectionData[id] = { ...collectionData[id], ...updateData };
            localStorage.setItem(collection, JSON.stringify(collectionData));
            return { success: true, data: collectionData[id] };
        }
        return { success: false, error: 'Record not found' };
    }

    getPatientConsultationsLocal(patientId, limit) {
        const consultations = JSON.parse(localStorage.getItem('consultations') || '{}');
        return Object.values(consultations)
            .filter(c => c.patientId === patientId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    getPatientRecordsLocal(patientId) {
        const records = JSON.parse(localStorage.getItem('medicalRecords') || '{}');
        return Object.values(records)
            .filter(r => r.patientId === patientId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getAnalyticsLocal(patientId, dateRange) {
        const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
        return Object.values(analytics)
            .filter(a => {
                const eventDate = new Date(a.timestamp);
                return a.patientId === patientId &&
                       eventDate >= new Date(dateRange.start) &&
                       eventDate <= new Date(dateRange.end);
            });
    }

    authenticateLocal(credentials) {
        // Simple local authentication for demo
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = Object.values(users).find(u => 
            u.email === credentials.email && u.password === credentials.password
        );
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, error: 'Invalid credentials' };
    }

    // Utility Methods
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    // Data Export for Migration
    async exportAllData() {
        const exportData = {
            patients: JSON.parse(localStorage.getItem('patients') || '{}'),
            consultations: JSON.parse(localStorage.getItem('consultations') || '{}'),
            medicalRecords: JSON.parse(localStorage.getItem('medicalRecords') || '{}'),
            imageAnalyses: JSON.parse(localStorage.getItem('imageAnalyses') || '{}'),
            analytics: JSON.parse(localStorage.getItem('analytics') || '{}'),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemed-data-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return exportData;
    }

    // Data Synchronization
    async syncWithCloud() {
        if (!this.isConnected) return { success: false, error: 'No database connection' };

        try {
            // Sync local data to cloud
            const localData = await this.exportAllData();
            const response = await fetch(`${this.apiBaseUrl}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localData)
            });

            return await response.json();
        } catch (error) {
            console.error('Sync failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize database connection
window.teleMedDB = new TeleMedDatabase();