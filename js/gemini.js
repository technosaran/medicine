class GeminiHealthAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        this.conversationHistory = [];
        this.systemPrompt = `You are a helpful AI health assistant. You provide general health information, symptom analysis, and wellness advice. 

IMPORTANT GUIDELINES:
- Always remind users that you provide general information only and cannot replace professional medical advice
- For serious symptoms or emergencies, always recommend seeking immediate medical attention
- Be empathetic and supportive in your responses
- Ask clarifying questions when needed to provide better assistance
- Provide practical, actionable advice when appropriate
- If unsure about something, clearly state your limitations

Focus on:
- Symptom analysis and possible causes
- General health and wellness tips
- When to seek professional medical care
- Medication information (general, not prescriptive)
- Preventive care recommendations`;

        this.imageSystemPrompt = `You are a medical AI assistant specialized in analyzing medical images and reports. You can help analyze:

MEDICAL IMAGE ANALYSIS:
- X-rays, CT scans, MRI images
- Lab reports and test results
- Skin conditions and rashes
- Medical documents and prescriptions
- General health-related images

IMPORTANT MEDICAL IMAGE GUIDELINES:
- ALWAYS state that this is for informational purposes only
- NEVER provide definitive diagnoses - only observations and suggestions
- ALWAYS recommend consulting with qualified healthcare professionals
- For urgent or concerning findings, strongly recommend immediate medical attention
- Be thorough but cautious in your analysis
- Explain what you observe in the image clearly
- Suggest appropriate next steps or specialists to consult

ANALYSIS APPROACH:
1. Describe what you observe in the image
2. Identify any notable findings or abnormalities
3. Provide general information about possible conditions (if applicable)
4. Recommend appropriate medical consultation
5. Suggest follow-up actions or tests if relevant`;

        // Specialized prompts for different health features
        this.specializedPrompts = {
            'symptom-analysis': `You are a medical AI assistant specialized in symptom analysis. When users describe symptoms:

SYMPTOM ANALYSIS GUIDELINES:
- Ask clarifying questions about symptom duration, severity, and associated symptoms
- Provide possible causes ranging from common to serious conditions
- Always emphasize when to seek immediate medical attention
- Give practical self-care advice when appropriate
- Never provide definitive diagnoses
- Always recommend professional medical evaluation for persistent or concerning symptoms

RESPONSE FORMAT:
1. Acknowledge the symptoms described
2. Ask relevant follow-up questions if needed
3. List possible causes (common to serious)
4. Provide red flag symptoms requiring immediate care
5. Suggest appropriate self-care measures
6. Recommend when and what type of medical professional to consult`,

            'medication-info': `You are a pharmaceutical AI assistant specialized in medication information. Provide:

MEDICATION INFORMATION GUIDELINES:
- General information about medications, their uses, and common side effects
- Drug interactions and contraindications
- Proper usage instructions and timing
- Storage requirements and safety precautions
- Never recommend specific dosages or prescribe medications
- Always advise consulting healthcare providers for prescription decisions

RESPONSE FORMAT:
1. Medication overview and primary uses
2. Common side effects and warnings
3. Important drug interactions
4. Proper usage guidelines
5. When to contact healthcare provider
6. Emphasize the importance of professional medical guidance`,

            'health-recommendations': `You are a wellness AI assistant focused on preventive health and lifestyle recommendations. Provide:

HEALTH RECOMMENDATIONS GUIDELINES:
- Evidence-based lifestyle and wellness advice
- Preventive care recommendations
- Healthy habits for specific conditions or age groups
- Nutrition and exercise guidance
- Mental health and stress management tips
- Always personalize advice based on user's situation
- Recommend regular check-ups and screenings

RESPONSE FORMAT:
1. Personalized health recommendations
2. Lifestyle modifications and healthy habits
3. Preventive care measures
4. Nutrition and exercise suggestions
5. Mental health considerations
6. Follow-up and monitoring recommendations`,

            'emergency-guidance': `You are an emergency medical AI assistant. Provide immediate guidance for urgent situations:

EMERGENCY GUIDANCE GUIDELINES:
- Quickly assess the urgency of the situation
- Provide immediate first aid instructions when appropriate
- Clearly state when to call emergency services (911/999/112)
- Give step-by-step emergency care instructions
- Remain calm and provide clear, actionable guidance
- Always prioritize calling professional emergency services for serious situations

RESPONSE FORMAT:
1. Immediate assessment of urgency
2. Call emergency services instruction (if needed)
3. Step-by-step first aid guidance
4. What to do while waiting for help
5. Important things to monitor
6. When to seek follow-up care`,

            'report-analysis': `You are a medical AI assistant specialized in analyzing medical reports and test results. Provide:

REPORT ANALYSIS GUIDELINES:
- Explain medical terminology in simple language
- Highlight normal vs abnormal values
- Explain what test results might indicate
- Never provide definitive diagnoses
- Always recommend discussing results with healthcare provider
- Suggest follow-up questions to ask the doctor

RESPONSE FORMAT:
1. Overview of the report/test type
2. Explanation of key findings in simple terms
3. Normal vs abnormal value interpretations
4. Possible implications of the results
5. Recommended follow-up actions
6. Questions to discuss with healthcare provider`
        };
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('geminiApiKey', key);
    }

    async sendMessage(message) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        // Create the full prompt with system instructions and conversation history
        const fullPrompt = this.buildFullPrompt(message);

        // Prepare the request body
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        try {
            console.log('Sending request to Gemini API...');
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    // If we can't parse the error response, use the status text
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates from API');
            }

            const candidate = data.candidates[0];
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response format from API');
            }

            const assistantMessage = candidate.content.parts[0].text;
            
            // Add both user message and assistant response to history
            this.conversationHistory.push({
                role: 'user',
                content: message
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return assistantMessage;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    buildFullPrompt(userMessage) {
        let prompt = this.systemPrompt + '\n\n';
        
        // Add conversation history if exists
        if (this.conversationHistory.length > 0) {
            prompt += 'Previous conversation:\n';
            prompt += this.formatConversationHistory() + '\n\n';
        }
        
        prompt += `User: ${userMessage}\n\nAssistant:`;
        return prompt;
    }

    formatConversationHistory() {
        return this.conversationHistory
            .slice(-6) // Keep last 6 messages for context
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    async analyzeImage(imageFile, userMessage = '') {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        if (!imageFile) {
            throw new Error('No image file provided');
        }

        try {
            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);
            const mimeType = imageFile.type;

            // Create the analysis prompt
            const analysisPrompt = userMessage ? 
                `${this.imageSystemPrompt}\n\nUser's question about this medical image: ${userMessage}\n\nPlease analyze this image and provide your assessment:` :
                `${this.imageSystemPrompt}\n\nPlease analyze this medical image and provide a comprehensive assessment:`;

            // Prepare the request body with image
            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: analysisPrompt
                            },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.3, // Lower temperature for more consistent medical analysis
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048, // More tokens for detailed analysis
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };

            console.log('Sending image analysis request to Gemini API...');
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Image analysis response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    // If we can't parse the error response, use the status text
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Image analysis API Response:', data);
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates from API');
            }

            const candidate = data.candidates[0];
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response format from API');
            }

            const analysisResult = candidate.content.parts[0].text;
            
            // Add image analysis to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: `[Image uploaded] ${userMessage || 'Please analyze this medical image'}`,
                hasImage: true,
                imageType: mimeType
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: analysisResult
            });

            return analysisResult;
        } catch (error) {
            console.error('Gemini Image Analysis Error:', error);
            throw error;
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    isImageFile(file) {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp',
            'image/tiff'
        ];
        return allowedTypes.includes(file.type);
    }

    getMaxImageSize() {
        return 20 * 1024 * 1024; // 20MB limit
    }

    validateImageFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!this.isImageFile(file)) {
            throw new Error('File must be an image (JPEG, PNG, GIF, WebP, BMP, or TIFF)');
        }

        if (file.size > this.getMaxImageSize()) {
            throw new Error('Image file size must be less than 20MB');
        }

        return true;
    }

    async sendSpecializedMessage(message, featureType) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        // Get specialized prompt for the feature
        const specializedPrompt = this.specializedPrompts[featureType] || this.systemPrompt;
        
        // Create the full prompt with specialized instructions
        const fullPrompt = this.buildSpecializedPrompt(message, specializedPrompt);

        // Prepare the request body
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: featureType === 'emergency-guidance' ? 0.3 : 0.7, // Lower temperature for emergency guidance
                topK: 40,
                topP: 0.95,
                maxOutputTokens: featureType === 'medication-info' ? 1536 : 1024, // More tokens for medication info
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        try {
            console.log(`Sending specialized ${featureType} request to Gemini API...`);
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    // If we can't parse the error response, use the status text
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Specialized API Response:', data);
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates from API');
            }

            const candidate = data.candidates[0];
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response format from API');
            }

            const assistantMessage = candidate.content.parts[0].text;
            
            // Add both user message and assistant response to history
            this.conversationHistory.push({
                role: 'user',
                content: message,
                featureType: featureType
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage,
                featureType: featureType
            });

            return assistantMessage;
        } catch (error) {
            console.error('Gemini Specialized API Error:', error);
            throw error;
        }
    }

    buildSpecializedPrompt(userMessage, specializedPrompt) {
        let prompt = specializedPrompt + '\n\n';
        
        // Add conversation history if exists
        if (this.conversationHistory.length > 0) {
            prompt += 'Previous conversation:\n';
            prompt += this.formatConversationHistory() + '\n\n';
        }
        
        prompt += `User: ${userMessage}\n\nAssistant:`;
        return prompt;
    }

    getQuickActions(featureType) {
        const quickActions = {
            'symptom-analysis': [
                'I have a headache and feel nauseous',
                'I\'ve been having chest pain',
                'I have a persistent cough',
                'I\'m experiencing dizziness',
                'I have abdominal pain'
            ],
            'medication-info': [
                'Tell me about ibuprofen',
                'What are the side effects of antibiotics?',
                'How should I take blood pressure medication?',
                'Can I take multiple vitamins together?',
                'What should I know about antidepressants?'
            ],
            'health-recommendations': [
                'How can I improve my heart health?',
                'What are good exercises for beginners?',
                'How can I eat healthier?',
                'Tips for better sleep',
                'How to manage stress effectively?'
            ],
            'image-analysis': [
                'Upload and analyze X-ray image',
                'Upload and check skin condition',
                'Upload and review lab report',
                'Upload and examine CT scan',
                'Upload medical document for analysis'
            ],
            'report-analysis': [
                'Explain my blood test results',
                'What do these lab values mean?',
                'Help me understand this medical report',
                'Interpret my imaging results',
                'Review my health screening results'
            ],
            'emergency-guidance': [
                'Someone is having chest pain',
                'Person is unconscious but breathing',
                'Severe allergic reaction symptoms',
                'Someone is choking',
                'Severe bleeding that won\'t stop'
            ]
        };

        return quickActions[featureType] || [];
    }

    async testConnection() {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        // Simple test request
        const testBody = {
            contents: [
                {
                    parts: [
                        {
                            text: "Hello! Please respond with 'API connection successful' to confirm you're working."
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 50,
            }
        };

        try {
            console.log('Testing API connection...');
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testBody)
            });

            console.log('Test response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                    console.error('API Error Details:', errorData);
                } catch (e) {
                    console.error('Could not parse error response');
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Test API Response:', data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return true;
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('API Test Failed:', error);
            throw error;
        }
    }
}

// Export for use in other files
window.GeminiHealthAssistant = GeminiHealthAssistant;