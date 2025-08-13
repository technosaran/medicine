// Patient Profile Management System
class PatientProfileManager {
    constructor(database) {
        this.db = database;
        this.currentProfile = null;
        this.setupProfileInterface();
    }

    setupProfileInterface() {
        this.createProfileModal();
        this.addProfileButton();
        this.loadCurrentProfile();
    }

    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user-md"></i> Patient Profile</h2>
                    <span class="close" onclick="window.patientProfile.closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="profileForm">
                        <div class="form-section">
                            <h3>Personal Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name *</label>
                                    <input type="text" id="firstName" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name *</label>
                                    <input type="text" id="lastName" name="lastName" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="dateOfBirth">Date of Birth</label>
                                    <input type="date" id="dateOfBirth" name="dateOfBirth">
                                </div>
                                <div class="form-group">
                                    <label for="gender">Gender</label>
                                    <select id="gender" name="gender">
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Contact Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" name="email">
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone Number</label>
                                    <input type="tel" id="phone" name="phone">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="address">Address</label>
                                <textarea id="address" name="address" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Medical Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="bloodType">Blood Type</label>
                                    <select id="bloodType" name="bloodType">
                                        <option value="">Select Blood Type</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="height">Height (cm)</label>
                                    <input type="number" id="height" name="height" min="50" max="250">
                                </div>
                                <div class="form-group">
                                    <label for="weight">Weight (kg)</label>
                                    <input type="number" id="weight" name="weight" min="20" max="300" step="0.1">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="allergies">Known Allergies</label>
                                <textarea id="allergies" name="allergies" rows="2" placeholder="List any known allergies..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="medications">Current Medications</label>
                                <textarea id="medications" name="medications" rows="2" placeholder="List current medications..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="medicalHistory">Medical History</label>
                                <textarea id="medicalHistory" name="medicalHistory" rows="3" placeholder="Brief medical history..."></textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Emergency Contact</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emergencyName">Contact Name</label>
                                    <input type="text" id="emergencyName" name="emergencyName">
                                </div>
                                <div class="form-group">
                                    <label for="emergencyPhone">Contact Phone</label>
                                    <input type="tel" id="emergencyPhone" name="emergencyPhone">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="emergencyRelation">Relationship</label>
                                <input type="text" id="emergencyRelation" name="emergencyRelation" placeholder="e.g., Spouse, Parent, Sibling">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.patientProfile.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Profile</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add form submission handler
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
    }

    addProfileButton() {
        const profileButton = document.createElement('button');
        profileButton.className = 'profile-button';
        profileButton.innerHTML = '<i class="fas fa-user"></i>';
        profileButton.title = 'Patient Profile';
        profileButton.onclick = () => this.openModal();

        document.body.appendChild(profileButton);
    }

    openModal() {
        const modal = document.getElementById('profileModal');
        modal.style.display = 'block';
        
        // Load existing profile data if available
        if (this.currentProfile) {
            this.populateForm(this.currentProfile);
        }
    }

    closeModal() {
        const modal = document.getElementById('profileModal');
        modal.style.display = 'none';
    }

    populateForm(profile) {
        const form = document.getElementById('profileForm');
        const formData = new FormData(form);
        
        Object.keys(profile).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = profile[key] || '';
            }
        });
    }

    async saveProfile() {
        const form = document.getElementById('profileForm');
        const formData = new FormData(form);
        const profileData = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            profileData[key] = value;
        }

        // Calculate BMI if height and weight are provided
        if (profileData.height && profileData.weight) {
            const heightM = profileData.height / 100;
            const bmi = (profileData.weight / (heightM * heightM)).toFixed(1);
            profileData.bmi = bmi;
        }

        // Calculate age if date of birth is provided
        if (profileData.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(profileData.dateOfBirth);
            const age = today.getFullYear() - birthDate.getFullYear();
            profileData.age = age;
        }

        try {
            let result;
            if (this.currentProfile && this.currentProfile.patientId) {
                // Update existing profile
                result = await this.db.updatePatient(this.currentProfile.patientId, profileData);
            } else {
                // Create new profile
                result = await this.db.createPatient(profileData);
            }

            if (result.success !== false) {
                this.currentProfile = result.data || result;
                this.db.currentUser = this.currentProfile;
                this.updateProfileDisplay();
                this.closeModal();
                this.showNotification('Profile saved successfully!', 'success');
                
                // Track profile update
                await this.db.saveAnalytics({
                    eventType: 'profile_updated',
                    eventData: { hasProfile: true }
                });
            } else {
                throw new Error(result.error || 'Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error saving profile: ' + error.message, 'error');
        }
    }

    async loadCurrentProfile() {
        // Try to load from current user or localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentProfile = JSON.parse(savedUser);
                this.db.currentUser = this.currentProfile;
                this.updateProfileDisplay();
            } catch (error) {
                console.error('Error loading saved profile:', error);
            }
        }
    }

    updateProfileDisplay() {
        if (!this.currentProfile) return;

        // Update profile button to show user info
        const profileButton = document.querySelector('.profile-button');
        if (profileButton && this.currentProfile.firstName) {
            profileButton.innerHTML = `<i class="fas fa-user"></i> ${this.currentProfile.firstName}`;
            profileButton.classList.add('has-profile');
        }

        // Add profile info to sidebar if in chat
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            this.addProfileInfoToSidebar(sidebar);
        }
    }

    addProfileInfoToSidebar(sidebar) {
        // Remove existing profile info
        const existingInfo = sidebar.querySelector('.profile-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        const profileInfo = document.createElement('div');
        profileInfo.className = 'profile-info';
        profileInfo.innerHTML = `
            <h4><i class="fas fa-user-circle"></i> Patient Info</h4>
            <div class="profile-details">
                <p><strong>Name:</strong> ${this.currentProfile.firstName} ${this.currentProfile.lastName}</p>
                ${this.currentProfile.age ? `<p><strong>Age:</strong> ${this.currentProfile.age} years</p>` : ''}
                ${this.currentProfile.bloodType ? `<p><strong>Blood Type:</strong> ${this.currentProfile.bloodType}</p>` : ''}
                ${this.currentProfile.bmi ? `<p><strong>BMI:</strong> ${this.currentProfile.bmi}</p>` : ''}
                ${this.currentProfile.allergies ? `<p><strong>Allergies:</strong> ${this.currentProfile.allergies}</p>` : ''}
            </div>
            <button class="btn btn-small btn-secondary" onclick="window.patientProfile.openModal()">
                <i class="fas fa-edit"></i> Edit Profile
            </button>
        `;

        // Insert after API config
        const apiConfig = sidebar.querySelector('.api-config');
        if (apiConfig) {
            apiConfig.after(profileInfo);
        } else {
            sidebar.insertBefore(profileInfo, sidebar.firstChild);
        }
    }

    async getConsultationHistory() {
        if (!this.currentProfile || !this.currentProfile.patientId) {
            return [];
        }

        try {
            return await this.db.getConsultationHistory(this.currentProfile.patientId);
        } catch (error) {
            console.error('Error loading consultation history:', error);
            return [];
        }
    }

    async getMedicalRecords() {
        if (!this.currentProfile || !this.currentProfile.patientId) {
            return [];
        }

        try {
            return await this.db.getMedicalRecords(this.currentProfile.patientId);
        } catch (error) {
            console.error('Error loading medical records:', error);
            return [];
        }
    }

    showNotification(message, type) {
        // Use existing notification system
        if (window.teleMedApp && window.teleMedApp.showNotification) {
            window.teleMedApp.showNotification(message, type);
        }
    }

    // Export profile data
    async exportProfile() {
        if (!this.currentProfile) {
            this.showNotification('No profile to export', 'error');
            return;
        }

        const exportData = {
            profile: this.currentProfile,
            consultationHistory: await this.getConsultationHistory(),
            medicalRecords: await this.getMedicalRecords(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patient-profile-${this.currentProfile.firstName}-${this.currentProfile.lastName}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Profile exported successfully!', 'success');
    }
}

// Initialize patient profile manager when database is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.teleMedDB) {
            window.patientProfile = new PatientProfileManager(window.teleMedDB);
        }
    }, 1000);
});