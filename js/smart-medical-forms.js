// Smart Medical Forms System
class SmartMedicalForms {
    constructor() {
        this.currentForm = null;
        this.formData = {};
        this.setupSmartForms();
    }

    setupSmartForms() {
        this.createFormTemplates();
        this.addSmartFormButton();
    }

    createFormTemplates() {
        this.formTemplates = {
            'symptom-analysis': {
                title: 'Symptom Assessment Form',
                icon: 'fas fa-stethoscope',
                sections: [
                    {
                        title: 'Primary Symptoms',
                        fields: [
                            {
                                type: 'body-diagram',
                                id: 'symptomLocation',
                                label: 'Where are you experiencing symptoms?',
                                required: true
                            },
                            {
                                type: 'pain-scale',
                                id: 'painLevel',
                                label: 'Pain/Discomfort Level (0-10)',
                                min: 0,
                                max: 10,
                                required: true
                            },
                            {
                                type: 'duration-picker',
                                id: 'symptomDuration',
                                label: 'How long have you had these symptoms?',
                                required: true
                            },
                            {
                                type: 'symptom-tags',
                                id: 'symptomTypes',
                                label: 'Select all symptoms you\'re experiencing',
                                options: [
                                    'Pain', 'Nausea', 'Dizziness', 'Fatigue', 'Fever',
                                    'Headache', 'Shortness of breath', 'Chest pain',
                                    'Abdominal pain', 'Joint pain', 'Muscle aches'
                                ]
                            }
                        ]
                    },
                    {
                        title: 'Additional Information',
                        fields: [
                            {
                                type: 'select',
                                id: 'symptomTrigger',
                                label: 'What triggered these symptoms?',
                                options: [
                                    'Unknown', 'Physical activity', 'Stress', 'Food/drink',
                                    'Weather change', 'Medication', 'Injury', 'Other'
                                ]
                            },
                            {
                                type: 'severity-timeline',
                                id: 'symptomProgression',
                                label: 'How have symptoms changed over time?',
                                options: ['Getting worse', 'Staying the same', 'Getting better', 'Comes and goes']
                            },
                            {
                                type: 'textarea',
                                id: 'additionalDetails',
                                label: 'Additional details or concerns',
                                placeholder: 'Describe any other symptoms or concerns...'
                            }
                        ]
                    }
                ]
            },
            'medication-info': {
                title: 'Medication Information Form',
                icon: 'fas fa-pills',
                sections: [
                    {
                        title: 'Current Medications',
                        fields: [
                            {
                                type: 'medication-list',
                                id: 'currentMedications',
                                label: 'List all medications you\'re currently taking',
                                required: true
                            },
                            {
                                type: 'allergy-checker',
                                id: 'knownAllergies',
                                label: 'Known drug allergies',
                                placeholder: 'List any known drug allergies...'
                            }
                        ]
                    },
                    {
                        title: 'Medication Questions',
                        fields: [
                            {
                                type: 'medication-search',
                                id: 'medicationQuery',
                                label: 'What medication would you like information about?',
                                placeholder: 'Enter medication name...'
                            },
                            {
                                type: 'checkbox-group',
                                id: 'informationType',
                                label: 'What information do you need?',
                                options: [
                                    'Side effects', 'Drug interactions', 'Dosage information',
                                    'How to take', 'Storage instructions', 'Contraindications'
                                ]
                            }
                        ]
                    }
                ]
            },
            'health-recommendations': {
                title: 'Health & Wellness Assessment',
                icon: 'fas fa-heart',
                sections: [
                    {
                        title: 'Lifestyle Information',
                        fields: [
                            {
                                type: 'activity-level',
                                id: 'exerciseLevel',
                                label: 'How often do you exercise?',
                                options: [
                                    'Never', 'Rarely (1-2 times/month)', 'Sometimes (1-2 times/week)',
                                    'Regularly (3-4 times/week)', 'Very active (5+ times/week)'
                                ]
                            },
                            {
                                type: 'diet-assessment',
                                id: 'dietQuality',
                                label: 'How would you rate your diet?',
                                options: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
                            },
                            {
                                type: 'sleep-tracker',
                                id: 'sleepHours',
                                label: 'Average hours of sleep per night',
                                min: 3,
                                max: 12,
                                step: 0.5
                            },
                            {
                                type: 'stress-level',
                                id: 'stressLevel',
                                label: 'Current stress level (1-10)',
                                min: 1,
                                max: 10
                            }
                        ]
                    },
                    {
                        title: 'Health Goals',
                        fields: [
                            {
                                type: 'checkbox-group',
                                id: 'healthGoals',
                                label: 'What are your health goals?',
                                options: [
                                    'Weight management', 'Better sleep', 'Stress reduction',
                                    'Increased energy', 'Better nutrition', 'More exercise',
                                    'Quit smoking', 'Reduce alcohol', 'Manage chronic condition'
                                ]
                            },
                            {
                                type: 'textarea',
                                id: 'specificConcerns',
                                label: 'Specific health concerns or questions',
                                placeholder: 'What specific health topics would you like advice on?'
                            }
                        ]
                    }
                ]
            }
        };
    }

    addSmartFormButton() {
        // Add smart form button to each health feature
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const featureItems = document.querySelectorAll('.feature-item');
                featureItems.forEach(item => {
                    const featureType = item.dataset.feature;
                    if (this.formTemplates[featureType]) {
                        const smartFormBtn = document.createElement('button');
                        smartFormBtn.className = 'smart-form-btn';
                        smartFormBtn.innerHTML = '<i class="fas fa-form"></i>';
                        smartFormBtn.title = 'Smart Medical Form';
                        smartFormBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.openSmartForm(featureType);
                        };
                        item.appendChild(smartFormBtn);
                    }
                });
            }, 1000);
        });
    }

    openSmartForm(featureType) {
        const template = this.formTemplates[featureType];
        if (!template) return;

        this.currentForm = featureType;
        this.formData = {};

        const modal = document.createElement('div');
        modal.className = 'smart-form-modal';
        modal.innerHTML = this.generateFormHTML(template);
        document.body.appendChild(modal);

        // Initialize form components
        this.initializeFormComponents(modal);
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 100);
    }

    generateFormHTML(template) {
        return `
            <div class="smart-form-content">
                <div class="smart-form-header">
                    <h2><i class="${template.icon}"></i> ${template.title}</h2>
                    <button class="close-btn" onclick="this.closest('.smart-form-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="smart-form-body">
                    <div class="form-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">0% Complete</span>
                    </div>
                    ${template.sections.map((section, index) => `
                        <div class="form-section ${index === 0 ? 'active' : ''}" data-section="${index}">
                            <h3>${section.title}</h3>
                            ${section.fields.map(field => this.generateFieldHTML(field)).join('')}
                            <div class="section-navigation">
                                ${index > 0 ? '<button class="btn btn-secondary prev-btn">Previous</button>' : ''}
                                ${index < template.sections.length - 1 ? 
                                    '<button class="btn btn-primary next-btn">Next</button>' : 
                                    '<button class="btn btn-primary submit-btn">Generate AI Analysis</button>'
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateFieldHTML(field) {
        switch (field.type) {
            case 'body-diagram':
                return `
                    <div class="form-field body-diagram-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="body-diagram-container" id="${field.id}">
                            <div class="body-diagram-placeholder">
                                <i class="fas fa-user-injured"></i>
                                <p>Click on body parts to indicate symptom locations</p>
                                <button class="btn btn-secondary" onclick="window.smartForms.openBodyDiagram('${field.id}')">
                                    Open Interactive Body Diagram
                                </button>
                            </div>
                            <div class="selected-areas" id="${field.id}-selected"></div>
                        </div>
                    </div>
                `;

            case 'pain-scale':
                return `
                    <div class="form-field pain-scale-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="pain-scale-container">
                            <div class="pain-scale-slider">
                                <input type="range" id="${field.id}" min="${field.min}" max="${field.max}" value="0" class="pain-slider">
                                <div class="pain-scale-labels">
                                    <span>No Pain</span>
                                    <span>Mild</span>
                                    <span>Moderate</span>
                                    <span>Severe</span>
                                    <span>Worst Pain</span>
                                </div>
                            </div>
                            <div class="pain-scale-value">
                                <span class="pain-number">0</span>
                                <span class="pain-description">No Pain</span>
                            </div>
                        </div>
                    </div>
                `;

            case 'duration-picker':
                return `
                    <div class="form-field duration-picker-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="duration-picker-container">
                            <select id="${field.id}-unit" class="duration-unit">
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days" selected>Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="years">Years</option>
                            </select>
                            <input type="number" id="${field.id}-value" class="duration-value" min="1" placeholder="Enter number">
                            <div class="duration-presets">
                                <button type="button" class="duration-preset" data-value="1" data-unit="hours">1 hour</button>
                                <button type="button" class="duration-preset" data-value="1" data-unit="days">1 day</button>
                                <button type="button" class="duration-preset" data-value="1" data-unit="weeks">1 week</button>
                                <button type="button" class="duration-preset" data-value="1" data-unit="months">1 month</button>
                            </div>
                        </div>
                    </div>
                `;

            case 'symptom-tags':
                return `
                    <div class="form-field symptom-tags-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="symptom-tags-container">
                            ${field.options.map(option => `
                                <label class="symptom-tag">
                                    <input type="checkbox" name="${field.id}" value="${option}">
                                    <span class="tag-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;

            case 'medication-list':
                return `
                    <div class="form-field medication-list-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="medication-list-container">
                            <div class="medication-entries" id="${field.id}-entries"></div>
                            <button type="button" class="btn btn-secondary add-medication" onclick="window.smartForms.addMedicationEntry('${field.id}')">
                                <i class="fas fa-plus"></i> Add Medication
                            </button>
                        </div>
                    </div>
                `;

            case 'activity-level':
            case 'diet-assessment':
                return `
                    <div class="form-field radio-group-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="radio-group">
                            ${field.options.map((option, index) => `
                                <label class="radio-option">
                                    <input type="radio" name="${field.id}" value="${option}">
                                    <span class="radio-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;

            case 'sleep-tracker':
            case 'stress-level':
                return `
                    <div class="form-field range-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="range-container">
                            <input type="range" id="${field.id}" min="${field.min}" max="${field.max}" step="${field.step || 1}" value="${field.min}">
                            <div class="range-value">
                                <span id="${field.id}-value">${field.min}</span>
                                ${field.id === 'sleepHours' ? ' hours' : ''}
                            </div>
                        </div>
                    </div>
                `;

            case 'checkbox-group':
                return `
                    <div class="form-field checkbox-group-field">
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="checkbox-group">
                            ${field.options.map(option => `
                                <label class="checkbox-option">
                                    <input type="checkbox" name="${field.id}" value="${option}">
                                    <span class="checkbox-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="form-field">
                        <label for="${field.id}">${field.label} ${field.required ? '*' : ''}</label>
                        ${field.type === 'textarea' ? 
                            `<textarea id="${field.id}" placeholder="${field.placeholder || ''}" rows="4"></textarea>` :
                            `<input type="${field.type}" id="${field.id}" placeholder="${field.placeholder || ''}">`
                        }
                    </div>
                `;
        }
    }

    initializeFormComponents(modal) {
        // Initialize pain scale
        const painSliders = modal.querySelectorAll('.pain-slider');
        painSliders.forEach(slider => {
            const updatePainDisplay = () => {
                const value = parseInt(slider.value);
                const numberDisplay = slider.closest('.pain-scale-container').querySelector('.pain-number');
                const descriptionDisplay = slider.closest('.pain-scale-container').querySelector('.pain-description');
                
                numberDisplay.textContent = value;
                
                const descriptions = ['No Pain', 'Mild Pain', 'Mild Pain', 'Moderate Pain', 'Moderate Pain', 
                                    'Moderate Pain', 'Severe Pain', 'Severe Pain', 'Very Severe Pain', 
                                    'Very Severe Pain', 'Worst Pain'];
                descriptionDisplay.textContent = descriptions[value];
                
                // Update slider color
                const percentage = (value / 10) * 100;
                slider.style.background = `linear-gradient(to right, #ff4757 0%, #ff4757 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
            };
            
            slider.addEventListener('input', updatePainDisplay);
            updatePainDisplay();
        });

        // Initialize duration presets
        const durationPresets = modal.querySelectorAll('.duration-preset');
        durationPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const value = preset.dataset.value;
                const unit = preset.dataset.unit;
                const container = preset.closest('.duration-picker-container');
                container.querySelector('.duration-value').value = value;
                container.querySelector('.duration-unit').value = unit;
                
                // Update active preset
                durationPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });

        // Initialize range sliders
        const rangeInputs = modal.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(range => {
            const updateValue = () => {
                const valueDisplay = modal.querySelector(`#${range.id}-value`);
                if (valueDisplay) {
                    valueDisplay.textContent = range.value;
                }
            };
            range.addEventListener('input', updateValue);
            updateValue();
        });

        // Initialize form navigation
        this.initializeFormNavigation(modal);
    }

    initializeFormNavigation(modal) {
        const sections = modal.querySelectorAll('.form-section');
        const progressBar = modal.querySelector('.progress-fill');
        const progressText = modal.querySelector('.progress-text');
        let currentSection = 0;

        const updateProgress = () => {
            const progress = ((currentSection + 1) / sections.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% Complete`;
        };

        const showSection = (index) => {
            sections.forEach((section, i) => {
                section.classList.toggle('active', i === index);
            });
            currentSection = index;
            updateProgress();
        };

        // Next/Previous buttons
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-btn')) {
                if (currentSection < sections.length - 1) {
                    showSection(currentSection + 1);
                }
            } else if (e.target.classList.contains('prev-btn')) {
                if (currentSection > 0) {
                    showSection(currentSection - 1);
                }
            } else if (e.target.classList.contains('submit-btn')) {
                this.submitSmartForm(modal);
            }
        });

        updateProgress();
    }

    addMedicationEntry(fieldId) {
        const container = document.getElementById(`${fieldId}-entries`);
        const entryCount = container.children.length;
        
        const entry = document.createElement('div');
        entry.className = 'medication-entry';
        entry.innerHTML = `
            <input type="text" placeholder="Medication name" class="med-name">
            <input type="text" placeholder="Dosage (e.g., 10mg)" class="med-dosage">
            <select class="med-frequency">
                <option value="">How often?</option>
                <option value="once-daily">Once daily</option>
                <option value="twice-daily">Twice daily</option>
                <option value="three-times-daily">Three times daily</option>
                <option value="as-needed">As needed</option>
                <option value="other">Other</option>
            </select>
            <button type="button" class="remove-medication" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(entry);
    }

    openBodyDiagram(fieldId) {
        // This will be implemented in the next component
        console.log('Opening body diagram for field:', fieldId);
        if (window.bodyDiagram) {
            window.bodyDiagram.open(fieldId);
        }
    }

    async submitSmartForm(modal) {
        const formData = this.collectFormData(modal);
        const submitBtn = modal.querySelector('.submit-btn');
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Analysis...';
        submitBtn.disabled = true;

        try {
            // Generate comprehensive prompt from form data
            const prompt = this.generateAIPrompt(formData);
            
            // Send to AI
            if (window.teleMedApp && window.teleMedApp.geminiAssistant) {
                const response = await window.teleMedApp.geminiAssistant.sendSpecializedMessage(prompt, this.currentForm);
                
                // Close form and show response
                modal.remove();
                
                // Add form summary to chat
                this.addFormSummaryToChat(formData);
                
                // Show success notification
                if (window.teleMedApp.showNotification) {
                    window.teleMedApp.showNotification('Smart form analysis complete!', 'success');
                }
            }
        } catch (error) {
            console.error('Error submitting smart form:', error);
            submitBtn.innerHTML = 'Generate AI Analysis';
            submitBtn.disabled = false;
            
            if (window.teleMedApp && window.teleMedApp.showNotification) {
                window.teleMedApp.showNotification('Error processing form: ' + error.message, 'error');
            }
        }
    }

    collectFormData(modal) {
        const data = {};
        
        // Collect all form inputs
        const inputs = modal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    if (!data[input.name]) data[input.name] = [];
                    data[input.name].push(input.value);
                }
            } else if (input.value) {
                data[input.id] = input.value;
            }
        });

        return data;
    }

    generateAIPrompt(formData) {
        let prompt = `Based on the detailed medical form submission, please provide a comprehensive analysis:\n\n`;
        
        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                prompt += `${key}: ${value.join(', ')}\n`;
            } else {
                prompt += `${key}: ${value}\n`;
            }
        });

        prompt += `\nPlease provide:\n1. Analysis of the reported information\n2. Possible conditions or causes\n3. Recommended next steps\n4. When to seek immediate medical attention\n5. Self-care suggestions if appropriate`;

        return prompt;
    }

    addFormSummaryToChat(formData) {
        if (!window.teleMedApp) return;

        const summary = `📋 Smart Medical Form Completed:\n\n${Object.entries(formData).map(([key, value]) => {
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            return `• ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${displayValue}`;
        }).join('\n')}`;

        window.teleMedApp.addSpecializedMessageToChat(summary, 'user', this.currentForm);
    }
}

// Initialize smart forms
window.smartForms = new SmartMedicalForms();