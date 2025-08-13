class ImageAnalysisApp {
    constructor() {
        this.geminiAssistant = null;
        this.currentImage = null;
        this.initializeApp();
    }

    initializeApp() {
        if (typeof GeminiHealthAssistant !== 'undefined') {
            this.geminiAssistant = new GeminiHealthAssistant();
            this.setupInterface();
        }
    }

    setupInterface() {
        const apiKeyInput = document.getElementById('apiKey');
        const saveConfigBtn = document.getElementById('saveConfig');
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const analyzeBtn = document.getElementById('analyzeImage');
        const newAnalysisBtn = document.getElementById('newAnalysis');
        const saveResultsBtn = document.getElementById('saveResults');
        const removeImageBtn = document.getElementById('removeImage');

        // Load saved API key
        if (this.geminiAssistant.apiKey) {
            apiKeyInput.value = this.geminiAssistant.apiKey;
            this.updateApiStatus(true);
            this.enableInterface();
        }

        // Save API key
        saveConfigBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                this.geminiAssistant.setApiKey(apiKey);
                this.testApiConnection();
            } else {
                this.updateApiStatus(false, 'API key is required');
            }
        });

        // Upload area handlers
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });

        // File input change
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        // Analyze button
        analyzeBtn.addEventListener('click', () => {
            this.analyzeCurrentImage();
        });

        // New analysis button
        newAnalysisBtn.addEventListener('click', () => {
            this.resetInterface();
        });

        // Save results button
        saveResultsBtn.addEventListener('click', () => {
            this.saveAnalysisResults();
        });

        // Remove image button
        removeImageBtn.addEventListener('click', () => {
            this.clearImage();
        });
    }

    async testApiConnection() {
        this.updateApiStatus(false, 'Testing connection...');

        try {
            await this.geminiAssistant.testConnection();
            this.updateApiStatus(true, 'API Connected Successfully');
            this.enableInterface();
            console.log('API connection test successful');
        } catch (error) {
            console.error('API connection test failed:', error);
            let errorMessage = 'Connection failed';

            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage = 'Invalid API key';
            } else if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage = 'API key lacks permissions';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage = 'API quota exceeded';
            } else if (error.message.includes('404')) {
                errorMessage = 'API endpoint not found';
            } else if (error.message.includes('403')) {
                errorMessage = 'API access forbidden - check your key';
            } else {
                errorMessage = `Error: ${error.message}`;
            }

            this.updateApiStatus(false, errorMessage);
        }
    }

    updateApiStatus(isConnected, message = '') {
        const statusElement = document.getElementById('apiStatus');
        if (isConnected) {
            statusElement.innerHTML = '<i class="fas fa-circle-check"></i> API Connected';
            statusElement.className = 'status connected';
        } else {
            const displayMessage = message || 'API Key Required';
            statusElement.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${displayMessage}`;
            statusElement.className = 'status error';
        }
    }

    enableInterface() {
        const analyzeBtn = document.getElementById('analyzeImage');
        if (analyzeBtn && this.currentImage) {
            analyzeBtn.disabled = false;
        }
    }

    handleImageUpload(file) {
        try {
            // Validate the image file
            this.geminiAssistant.validateImageFile(file);

            // Store the current image
            this.currentImage = file;

            // Show preview
            this.showImagePreview(file);

            // Show analysis section
            document.getElementById('analysisSection').style.display = 'block';

            // Enable analyze button if API is connected
            if (this.geminiAssistant.apiKey) {
                document.getElementById('analyzeImage').disabled = false;
            }

        } catch (error) {
            alert(`Error uploading image: ${error.message}`);
        }
    }

    showImagePreview(file) {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const imageName = document.getElementById('imageName');
        const imageSize = document.getElementById('imageSize');
        const imageType = document.getElementById('imageType');

        // Hide upload area and show preview
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';

        // Set image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Set image details
        imageName.textContent = file.name;
        imageSize.textContent = this.formatFileSize(file.size);
        imageType.textContent = file.type;
    }

    async analyzeCurrentImage() {
        if (!this.currentImage) {
            alert('Please upload an image first');
            return;
        }

        if (!this.geminiAssistant.apiKey) {
            alert('Please configure your API key first');
            return;
        }

        const analysisQuery = document.getElementById('analysisQuery').value.trim();
        const analyzeBtn = document.getElementById('analyzeImage');
        const resultsSection = document.getElementById('analysisResults');
        const resultsContent = document.getElementById('resultsContent');
        const timestamp = document.getElementById('analysisTimestamp');

        // Disable button and show loading
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        try {
            console.log('Starting image analysis...');
            const analysisResult = await this.geminiAssistant.analyzeImage(this.currentImage, analysisQuery);

            // Show results
            resultsContent.innerHTML = this.formatAnalysisResult(analysisResult);
            timestamp.textContent = `Analysis completed: ${new Date().toLocaleString()}`;
            resultsSection.style.display = 'block';

            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            console.log('Image analysis completed successfully');

        } catch (error) {
            console.error('Error analyzing image:', error);

            let errorMessage = 'Sorry, I encountered an error analyzing the image: ';
            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage += 'Your API key is invalid. Please check and update it.';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage += 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage += 'API access denied. Please check your API key permissions.';
            } else {
                errorMessage += error.message;
            }

            resultsContent.innerHTML = `<div class="error-result">${errorMessage}</div>`;
            resultsSection.style.display = 'block';

        } finally {
            // Re-enable button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
        }
    }

    formatAnalysisResult(result) {
        // Format the analysis result with better styling
        const formattedResult = result
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');

        return `
            <div class="analysis-content">
                ${formattedResult}
            </div>
            <div class="medical-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Medical Disclaimer:</strong> This analysis is for informational purposes only. 
                Always consult qualified healthcare professionals for medical diagnosis and treatment.
            </div>
        `;
    }

    clearImage() {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const imageInput = document.getElementById('imageInput');
        const analysisSection = document.getElementById('analysisSection');
        const resultsSection = document.getElementById('analysisResults');

        // Reset UI
        uploadArea.style.display = 'block';
        imagePreview.style.display = 'none';
        analysisSection.style.display = 'none';
        resultsSection.style.display = 'none';

        // Clear input
        imageInput.value = '';
        document.getElementById('analysisQuery').value = '';

        // Clear current image
        this.currentImage = null;
    }

    resetInterface() {
        this.clearImage();
    }

    saveAnalysisResults() {
        const resultsContent = document.getElementById('resultsContent');
        const timestamp = document.getElementById('analysisTimestamp');

        if (!resultsContent.textContent.trim()) {
            alert('No analysis results to save');
            return;
        }

        // Create a formatted text version of the results
        const results = {
            timestamp: timestamp.textContent,
            imageName: this.currentImage ? this.currentImage.name : 'Unknown',
            imageSize: this.currentImage ? this.formatFileSize(this.currentImage.size) : 'Unknown',
            query: document.getElementById('analysisQuery').value.trim() || 'General analysis',
            analysis: resultsContent.textContent.trim()
        };

        const resultText = `
MEDICAL IMAGE ANALYSIS REPORT
=============================

Timestamp: ${results.timestamp}
Image File: ${results.imageName}
File Size: ${results.imageSize}
Analysis Query: ${results.query}

ANALYSIS RESULTS:
${results.analysis}

DISCLAIMER:
This analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

Generated by TeleMed AI Assistant
        `.trim();

        // Create and download the file
        const blob = new Blob([resultText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageAnalysisApp = new ImageAnalysisApp();
});