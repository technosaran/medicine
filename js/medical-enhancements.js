// Advanced Medical Features
class MedicalEnhancements {
    constructor(geminiAssistant) {
        this.gemini = geminiAssistant;
        this.setupMedicalFeatures();
    }

    setupMedicalFeatures() {
        this.addSymptomChecker();
        this.addDrugInteractionChecker();
        this.addVitalSignsTracker();
        this.addMedicalCalculators();
    }

    addSymptomChecker() {
        // Interactive symptom checker with body diagram
        const symptomChecker = {
            bodyParts: [
                'head', 'neck', 'chest', 'abdomen', 'arms', 'legs', 'back'
            ],
            
            createBodyDiagram() {
                return `
                    <div class="body-diagram">
                        <svg viewBox="0 0 200 400" class="body-svg">
                            <!-- Simple body outline -->
                            <ellipse cx="100" cy="40" rx="25" ry="35" class="body-part" data-part="head"/>
                            <rect x="85" y="70" width="30" height="15" class="body-part" data-part="neck"/>
                            <rect x="70" y="85" width="60" height="80" class="body-part" data-part="chest"/>
                            <rect x="75" y="165" width="50" height="60" class="body-part" data-part="abdomen"/>
                            <rect x="40" y="85" width="25" height="100" class="body-part" data-part="left-arm"/>
                            <rect x="135" y="85" width="25" height="100" class="body-part" data-part="right-arm"/>
                            <rect x="80" y="225" width="15" height="120" class="body-part" data-part="left-leg"/>
                            <rect x="105" y="225" width="15" height="120" class="body-part" data-part="right-leg"/>
                        </svg>
                        <p>Click on body parts to describe symptoms</p>
                    </div>
                `;
            }
        };

        this.symptomChecker = symptomChecker;
    }

    addDrugInteractionChecker() {
        const interactionChecker = {
            async checkInteractions(medications) {
                const prompt = `
                    As a pharmaceutical AI, analyze potential interactions between these medications:
                    ${medications.join(', ')}
                    
                    Provide:
                    1. Major interactions and warnings
                    2. Minor interactions to monitor
                    3. Recommendations for timing
                    4. When to consult healthcare provider
                `;
                
                return await this.gemini.sendSpecializedMessage(prompt, 'medication-info');
            }
        };

        this.interactionChecker = interactionChecker;
    }

    addVitalSignsTracker() {
        const vitalSigns = {
            bloodPressure: { systolic: null, diastolic: null },
            heartRate: null,
            temperature: null,
            oxygenSaturation: null,
            
            interpretVitals() {
                const interpretation = [];
                
                if (this.bloodPressure.systolic && this.bloodPressure.diastolic) {
                    const sys = this.bloodPressure.systolic;
                    const dia = this.bloodPressure.diastolic;
                    
                    if (sys >= 180 || dia >= 120) {
                        interpretation.push('⚠️ Hypertensive Crisis - Seek immediate medical attention');
                    } else if (sys >= 140 || dia >= 90) {
                        interpretation.push('🔴 High Blood Pressure - Consult healthcare provider');
                    } else if (sys < 90 || dia < 60) {
                        interpretation.push('🔵 Low Blood Pressure - Monitor symptoms');
                    } else {
                        interpretation.push('✅ Normal Blood Pressure');
                    }
                }
                
                if (this.heartRate) {
                    if (this.heartRate > 100) {
                        interpretation.push('🔴 Elevated Heart Rate (Tachycardia)');
                    } else if (this.heartRate < 60) {
                        interpretation.push('🔵 Low Heart Rate (Bradycardia)');
                    } else {
                        interpretation.push('✅ Normal Heart Rate');
                    }
                }
                
                return interpretation;
            }
        };

        this.vitalSigns = vitalSigns;
    }

    addMedicalCalculators() {
        const calculators = {
            bmi: (weight, height) => {
                const bmi = weight / (height * height);
                let category = '';
                
                if (bmi < 18.5) category = 'Underweight';
                else if (bmi < 25) category = 'Normal weight';
                else if (bmi < 30) category = 'Overweight';
                else category = 'Obese';
                
                return { bmi: bmi.toFixed(1), category };
            },
            
            dosageCalculator: (weight, dosePerKg) => {
                return (weight * dosePerKg).toFixed(1);
            },
            
            pregnancyDueDate: (lastPeriod) => {
                const lmp = new Date(lastPeriod);
                const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
                return dueDate.toDateString();
            }
        };

        this.calculators = calculators;
    }

    createMedicalToolsInterface() {
        return `
            <div class="medical-tools">
                <h3>Medical Tools</h3>
                
                <div class="tool-section">
                    <h4>BMI Calculator</h4>
                    <input type="number" id="weight" placeholder="Weight (kg)">
                    <input type="number" id="height" placeholder="Height (m)">
                    <button onclick="calculateBMI()">Calculate BMI</button>
                    <div id="bmi-result"></div>
                </div>
                
                <div class="tool-section">
                    <h4>Vital Signs Tracker</h4>
                    <input type="number" id="systolic" placeholder="Systolic BP">
                    <input type="number" id="diastolic" placeholder="Diastolic BP">
                    <input type="number" id="heart-rate" placeholder="Heart Rate">
                    <button onclick="trackVitals()">Analyze Vitals</button>
                    <div id="vitals-result"></div>
                </div>
                
                <div class="tool-section">
                    <h4>Drug Interaction Checker</h4>
                    <textarea id="medications" placeholder="Enter medications (one per line)"></textarea>
                    <button onclick="checkInteractions()">Check Interactions</button>
                    <div id="interaction-result"></div>
                </div>
            </div>
        `;
    }
}