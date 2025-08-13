// Enhanced AI Context Engine
class EnhancedAIContext {
    constructor(geminiAssistant) {
        this.gemini = geminiAssistant;
        this.patientContext = {};
        this.medicalKnowledge = {};
        this.conversationMemory = [];
        this.setupEnhancedContext();
    }

    setupEnhancedContext() {
        this.initializeMedicalKnowledge();
        this.enhanceGeminiPrompts();
        this.setupContextTracking();
    }

    initializeMedicalKnowledge() {
        this.medicalKnowledge = {
            redFlags: {
                'chest-pain': [
                    'Crushing chest pain',
                    'Pain radiating to arm, jaw, or back',
                    'Shortness of breath with chest pain',
                    'Chest pain with sweating',
                    'Sudden severe chest pain'
                ],
                'headache': [
                    'Sudden severe headache (worst ever)',
                    'Headache with fever and neck stiffness',
                    'Headache with vision changes',
                    'Headache after head injury',
                    'Headache with confusion'
                ],
                'abdominal-pain': [
                    'Severe sudden abdominal pain',
                    'Abdominal pain with vomiting blood',
                    'Rigid abdomen',
                    'Abdominal pain with high fever',
                    'Pain that prevents movement'
                ]
            },
            
            commonConditions: {
                'headache': {
                    'tension': {
                        symptoms: ['bilateral pain', 'pressure sensation', 'stress-related'],
                        treatment: ['rest', 'hydration', 'stress management'],
                        duration: 'hours to days'
                    },
                    'migraine': {
                        symptoms: ['unilateral pain', 'nausea', 'light sensitivity'],
                        treatment: ['dark room', 'rest', 'medication'],
                        duration: '4-72 hours'
                    }
                },
                'fever': {
                    'viral': {
                        symptoms: ['gradual onset', 'body aches', 'fatigue'],
                        treatment: ['rest', 'fluids', 'fever reducers'],
                        duration: '3-7 days'
                    },
                    'bacterial': {
                        symptoms: ['rapid onset', 'high fever', 'localized symptoms'],
                        treatment: ['medical evaluation', 'possible antibiotics'],
                        duration: 'variable'
                    }
                }
            },

            drugInteractions: {
                'warfarin': ['aspirin', 'ibuprofen', 'vitamin K supplements'],
                'metformin': ['alcohol', 'contrast dyes'],
                'lisinopril': ['potassium supplements', 'NSAIDs']
            },

            specialistReferrals: {
                'cardiology': ['chest pain', 'heart palpitations', 'high blood pressure'],
                'neurology': ['severe headaches', 'seizures', 'memory problems'],
                'gastroenterology': ['persistent abdominal pain', 'digestive issues'],
                'dermatology': ['skin changes', 'moles', 'rashes'],
                'orthopedics': ['joint pain', 'fractures', 'mobility issues']
            }
        };
    }

    enhanceGeminiPrompts() {
        // Override the original sendSpecializedMessage to include enhanced context
        const originalSendSpecialized = this.gemini.sendSpecializedMessage;
        
        this.gemini.sendSpecializedMessage = async (message, featureType) => {
            // Add enhanced context to the message
            const enhancedMessage = await this.enhanceMessageWithContext(message, featureType);
            
            // Call original method with enhanced message
            const response = await originalSendSpecialized.call(this.gemini, enhancedMessage, featureType);
            
            // Process and enhance the response
            const enhancedResponse = await this.enhanceResponse(response, featureType, message);
            
            // Update conversation memory
            this.updateConversationMemory(message, enhancedResponse, featureType);
            
            return enhancedResponse;
        };
    }

    async enhanceMessageWithContext(message, featureType) {
        let enhancedMessage = message;
        
        // Add patient context if available
        if (window.patientProfile && window.patientProfile.currentProfile) {
            const profile = window.patientProfile.currentProfile;
            enhancedMessage += `\n\nPATIENT CONTEXT:\n`;
            enhancedMessage += `Age: ${profile.age || 'Unknown'}\n`;
            enhancedMessage += `Gender: ${profile.gender || 'Unknown'}\n`;
            if (profile.allergies) enhancedMessage += `Allergies: ${profile.allergies}\n`;
            if (profile.medications) enhancedMessage += `Current Medications: ${profile.medications}\n`;
            if (profile.medicalHistory) enhancedMessage += `Medical History: ${profile.medicalHistory}\n`;
        }

        // Add conversation history context
        if (this.conversationMemory.length > 0) {
            enhancedMessage += `\n\nRECENT CONVERSATION CONTEXT:\n`;
            const recentContext = this.conversationMemory.slice(-3).map(item => 
                `${item.timestamp}: ${item.featureType} - ${item.userMessage.substring(0, 100)}...`
            ).join('\n');
            enhancedMessage += recentContext;
        }

        // Add red flag checking for symptom analysis
        if (featureType === 'symptom-analysis') {
            enhancedMessage += `\n\nRED FLAG ASSESSMENT REQUIRED:\n`;
            enhancedMessage += `Please specifically check for emergency symptoms and clearly state if immediate medical attention is needed.\n`;
            enhancedMessage += `Red flags to consider: ${this.getRelevantRedFlags(message).join(', ')}`;
        }

        // Add drug interaction checking for medication info
        if (featureType === 'medication-info') {
            enhancedMessage += `\n\nDRUG INTERACTION ANALYSIS:\n`;
            enhancedMessage += `Please check for potential interactions with patient's current medications.\n`;
        }

        return enhancedMessage;
    }

    async enhanceResponse(response, featureType, originalMessage) {
        let enhancedResponse = response;

        // Add specialist referral suggestions
        const specialistSuggestions = this.getSpecialistReferrals(originalMessage, featureType);
        if (specialistSuggestions.length > 0) {
            enhancedResponse += `\n\n🏥 **SPECIALIST REFERRAL SUGGESTIONS:**\n`;
            specialistSuggestions.forEach(specialist => {
                enhancedResponse += `• Consider consulting a ${specialist} for specialized evaluation\n`;
            });
        }

        // Add follow-up recommendations
        const followUp = this.generateFollowUpRecommendations(featureType, originalMessage);
        if (followUp) {
            enhancedResponse += `\n\n📋 **FOLLOW-UP RECOMMENDATIONS:**\n${followUp}`;
        }

        // Add emergency protocols if needed
        const emergencyCheck = this.checkForEmergencySymptoms(originalMessage);
        if (emergencyCheck.isEmergency) {
            enhancedResponse = `🚨 **EMERGENCY ALERT:** ${emergencyCheck.reason}\n\n` + enhancedResponse;
            enhancedResponse += `\n\n🚨 **IMMEDIATE ACTION REQUIRED:**\n`;
            enhancedResponse += `• Call emergency services (911) immediately\n`;
            enhancedResponse += `• Do not delay seeking medical attention\n`;
            enhancedResponse += `• This is a potentially life-threatening situation\n`;
        }

        // Add medication safety warnings
        if (featureType === 'medication-info') {
            const safetyWarnings = this.generateMedicationSafetyWarnings(originalMessage);
            if (safetyWarnings) {
                enhancedResponse += `\n\n⚠️ **MEDICATION SAFETY WARNINGS:**\n${safetyWarnings}`;
            }
        }

        return enhancedResponse;
    }

    getRelevantRedFlags(message) {
        const messageLower = message.toLowerCase();
        let relevantFlags = [];

        Object.entries(this.medicalKnowledge.redFlags).forEach(([condition, flags]) => {
            if (messageLower.includes(condition.replace('-', ' ')) || 
                messageLower.includes(condition.replace('-', ''))) {
                relevantFlags = relevantFlags.concat(flags);
            }
        });

        return relevantFlags;
    }

    checkForEmergencySymptoms(message) {
        const emergencyKeywords = [
            'chest pain', 'difficulty breathing', 'severe headache', 'unconscious',
            'severe bleeding', 'choking', 'severe allergic reaction', 'stroke symptoms',
            'heart attack', 'severe abdominal pain', 'high fever with stiff neck'
        ];

        const messageLower = message.toLowerCase();
        
        for (const keyword of emergencyKeywords) {
            if (messageLower.includes(keyword)) {
                return {
                    isEmergency: true,
                    reason: `Potential emergency symptoms detected: ${keyword}`
                };
            }
        }

        return { isEmergency: false };
    }

    getSpecialistReferrals(message, featureType) {
        const messageLower = message.toLowerCase();
        let suggestions = [];

        Object.entries(this.medicalKnowledge.specialistReferrals).forEach(([specialist, conditions]) => {
            conditions.forEach(condition => {
                if (messageLower.includes(condition.toLowerCase())) {
                    if (!suggestions.includes(specialist)) {
                        suggestions.push(specialist);
                    }
                }
            });
        });

        return suggestions;
    }

    generateFollowUpRecommendations(featureType, message) {
        const recommendations = {
            'symptom-analysis': [
                'Monitor symptoms for changes in severity or new symptoms',
                'Keep a symptom diary with dates, times, and triggers',
                'Schedule follow-up if symptoms persist or worsen',
                'Take photos of visible symptoms for medical records'
            ],
            'medication-info': [
                'Discuss any concerns with your pharmacist or doctor',
                'Set up medication reminders to ensure compliance',
                'Keep an updated list of all medications',
                'Report any side effects to your healthcare provider'
            ],
            'health-recommendations': [
                'Set realistic, achievable health goals',
                'Track progress with a health journal or app',
                'Schedule regular check-ups with your healthcare provider',
                'Consider working with a health coach or nutritionist'
            ]
        };

        const recs = recommendations[featureType];
        if (recs) {
            return recs.map(rec => `• ${rec}`).join('\n');
        }
        return null;
    }

    generateMedicationSafetyWarnings(message) {
        const messageLower = message.toLowerCase();
        let warnings = [];

        // Check for high-risk medications
        const highRiskMeds = ['warfarin', 'insulin', 'digoxin', 'lithium', 'methotrexate'];
        highRiskMeds.forEach(med => {
            if (messageLower.includes(med)) {
                warnings.push(`${med.charAt(0).toUpperCase() + med.slice(1)} requires careful monitoring and regular blood tests`);
            }
        });

        // Check for pregnancy warnings
        if (messageLower.includes('pregnant') || messageLower.includes('pregnancy')) {
            warnings.push('Many medications are not safe during pregnancy - consult your doctor before taking any medication');
        }

        // Check for age-related warnings
        if (messageLower.includes('elderly') || messageLower.includes('senior')) {
            warnings.push('Older adults may need adjusted dosages and are at higher risk for side effects');
        }

        return warnings.length > 0 ? warnings.map(w => `• ${w}`).join('\n') : null;
    }

    updateConversationMemory(userMessage, aiResponse, featureType) {
        this.conversationMemory.push({
            timestamp: new Date().toISOString(),
            userMessage,
            aiResponse,
            featureType,
            patientId: window.patientProfile?.currentProfile?.patientId || 'anonymous'
        });

        // Keep only last 10 conversations in memory
        if (this.conversationMemory.length > 10) {
            this.conversationMemory.shift();
        }

        // Save to database if available
        if (window.teleMedDB) {
            window.teleMedDB.saveAnalytics({
                eventType: 'enhanced_consultation',
                eventData: {
                    featureType,
                    hasPatientContext: !!window.patientProfile?.currentProfile,
                    messageLength: userMessage.length,
                    responseLength: aiResponse.length
                }
            });
        }
    }

    setupContextTracking() {
        // Track user interactions for better context
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feature-item')) {
                const featureType = e.target.dataset.feature;
                this.trackFeatureUsage(featureType);
            }
        });
    }

    trackFeatureUsage(featureType) {
        if (!this.patientContext.featureUsage) {
            this.patientContext.featureUsage = {};
        }
        
        this.patientContext.featureUsage[featureType] = 
            (this.patientContext.featureUsage[featureType] || 0) + 1;
    }

    // Public methods for external use
    getPatientInsights() {
        const insights = {
            totalConsultations: this.conversationMemory.length,
            mostUsedFeature: this.getMostUsedFeature(),
            recentConcerns: this.getRecentConcerns(),
            riskFactors: this.identifyRiskFactors()
        };

        return insights;
    }

    getMostUsedFeature() {
        if (!this.patientContext.featureUsage) return null;
        
        return Object.entries(this.patientContext.featureUsage)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
    }

    getRecentConcerns() {
        return this.conversationMemory
            .slice(-5)
            .map(item => ({
                date: item.timestamp,
                feature: item.featureType,
                concern: item.userMessage.substring(0, 100) + '...'
            }));
    }

    identifyRiskFactors() {
        const riskFactors = [];
        const profile = window.patientProfile?.currentProfile;
        
        if (profile) {
            if (profile.age > 65) riskFactors.push('Advanced age');
            if (profile.allergies) riskFactors.push('Known allergies');
            if (profile.medications) riskFactors.push('Multiple medications');
            
            // Check conversation history for recurring issues
            const recentMessages = this.conversationMemory.slice(-10);
            const symptomFrequency = {};
            
            recentMessages.forEach(item => {
                if (item.featureType === 'symptom-analysis') {
                    const message = item.userMessage.toLowerCase();
                    if (message.includes('pain')) {
                        symptomFrequency.pain = (symptomFrequency.pain || 0) + 1;
                    }
                    if (message.includes('headache')) {
                        symptomFrequency.headache = (symptomFrequency.headache || 0) + 1;
                    }
                }
            });
            
            Object.entries(symptomFrequency).forEach(([symptom, count]) => {
                if (count >= 3) {
                    riskFactors.push(`Recurring ${symptom} complaints`);
                }
            });
        }
        
        return riskFactors;
    }
}

// Initialize enhanced AI context when Gemini is available
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.teleMedApp && window.teleMedApp.geminiAssistant) {
            window.enhancedAI = new EnhancedAIContext(window.teleMedApp.geminiAssistant);
            console.log('Enhanced AI Context initialized');
        }
    }, 2000);
});