// Interactive Body Diagram System
class InteractiveBodyDiagram {
    constructor() {
        this.selectedAreas = new Set();
        this.currentFieldId = null;
        this.setupBodyDiagram();
    }

    setupBodyDiagram() {
        this.bodyParts = {
            'head': { name: 'Head', color: '#ff6b6b' },
            'neck': { name: 'Neck', color: '#4ecdc4' },
            'chest': { name: 'Chest', color: '#45b7d1' },
            'abdomen': { name: 'Abdomen', color: '#96ceb4' },
            'left-arm': { name: 'Left Arm', color: '#ffeaa7' },
            'right-arm': { name: 'Right Arm', color: '#ffeaa7' },
            'left-leg': { name: 'Left Leg', color: '#dda0dd' },
            'right-leg': { name: 'Right Leg', color: '#dda0dd' },
            'back': { name: 'Back', color: '#fab1a0' },
            'left-shoulder': { name: 'Left Shoulder', color: '#fd79a8' },
            'right-shoulder': { name: 'Right Shoulder', color: '#fd79a8' },
            'left-hand': { name: 'Left Hand', color: '#fdcb6e' },
            'right-hand': { name: 'Right Hand', color: '#fdcb6e' },
            'left-foot': { name: 'Left Foot', color: '#a29bfe' },
            'right-foot': { name: 'Right Foot', color: '#a29bfe' }
        };
    }

    open(fieldId) {
        this.currentFieldId = fieldId;
        this.selectedAreas.clear();
        
        const modal = document.createElement('div');
        modal.className = 'body-diagram-modal';
        modal.innerHTML = this.generateBodyDiagramHTML();
        document.body.appendChild(modal);

        // Initialize interactions
        this.initializeBodyInteractions(modal);
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 100);
    }

    generateBodyDiagramHTML() {
        return `
            <div class="body-diagram-content">
                <div class="body-diagram-header">
                    <h2><i class="fas fa-user-injured"></i> Select Symptom Locations</h2>
                    <button class="close-btn" onclick="this.closest('.body-diagram-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="body-diagram-body">
                    <div class="diagram-container">
                        <div class="body-views">
                            <div class="body-view active" data-view="front">
                                <h3>Front View</h3>
                                <div class="body-svg-container">
                                    ${this.generateFrontBodySVG()}
                                </div>
                            </div>
                            <div class="body-view" data-view="back">
                                <h3>Back View</h3>
                                <div class="body-svg-container">
                                    ${this.generateBackBodySVG()}
                                </div>
                            </div>
                        </div>
                        <div class="view-switcher">
                            <button class="view-btn active" data-view="front">Front</button>
                            <button class="view-btn" data-view="back">Back</button>
                        </div>
                    </div>
                    <div class="symptom-details">
                        <h3>Selected Areas</h3>
                        <div class="selected-areas-list" id="selectedAreasList">
                            <p class="no-selection">Click on body parts to select symptom locations</p>
                        </div>
                        <div class="pain-intensity-section" style="display: none;">
                            <h4>Pain Intensity for Selected Areas</h4>
                            <div class="intensity-controls" id="intensityControls"></div>
                        </div>
                        <div class="symptom-description">
                            <label for="symptomDescription">Describe the symptoms in selected areas:</label>
                            <textarea id="symptomDescription" placeholder="Describe the type of pain, discomfort, or other symptoms..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="body-diagram-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.body-diagram-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.bodyDiagram.saveSelection()">Save Selection</button>
                </div>
            </div>
        `;
    }

    generateFrontBodySVG() {
        return `
            <svg viewBox="0 0 300 500" class="body-svg">
                <!-- Head -->
                <ellipse cx="150" cy="60" rx="35" ry="45" class="body-part" data-part="head" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Neck -->
                <rect x="135" y="100" width="30" height="20" class="body-part" data-part="neck" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Shoulders -->
                <ellipse cx="110" cy="130" rx="25" ry="15" class="body-part" data-part="left-shoulder" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <ellipse cx="190" cy="130" rx="25" ry="15" class="body-part" data-part="right-shoulder" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Chest -->
                <rect x="120" y="120" width="60" height="80" rx="10" class="body-part" data-part="chest" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Abdomen -->
                <rect x="125" y="200" width="50" height="70" rx="8" class="body-part" data-part="abdomen" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Arms -->
                <rect x="70" y="140" width="25" height="120" rx="12" class="body-part" data-part="left-arm" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <rect x="205" y="140" width="25" height="120" rx="12" class="body-part" data-part="right-arm" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Hands -->
                <ellipse cx="82" cy="275" rx="15" ry="20" class="body-part" data-part="left-hand" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <ellipse cx="218" cy="275" rx="15" ry="20" class="body-part" data-part="right-hand" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Legs -->
                <rect x="130" y="270" width="20" height="150" rx="10" class="body-part" data-part="left-leg" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <rect x="150" y="270" width="20" height="150" rx="10" class="body-part" data-part="right-leg" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Feet -->
                <ellipse cx="140" cy="435" rx="12" ry="18" class="body-part" data-part="left-foot" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <ellipse cx="160" cy="435" rx="12" ry="18" class="body-part" data-part="right-foot" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Labels -->
                <text x="150" y="65" text-anchor="middle" font-size="10" fill="#666">Head</text>
                <text x="150" y="160" text-anchor="middle" font-size="10" fill="#666">Chest</text>
                <text x="150" y="235" text-anchor="middle" font-size="10" fill="#666">Abdomen</text>
                <text x="82" y="200" text-anchor="middle" font-size="8" fill="#666">L.Arm</text>
                <text x="218" y="200" text-anchor="middle" font-size="8" fill="#666">R.Arm</text>
                <text x="140" y="350" text-anchor="middle" font-size="8" fill="#666">L.Leg</text>
                <text x="160" y="350" text-anchor="middle" font-size="8" fill="#666">R.Leg</text>
            </svg>
        `;
    }

    generateBackBodySVG() {
        return `
            <svg viewBox="0 0 300 500" class="body-svg">
                <!-- Head (back) -->
                <ellipse cx="150" cy="60" rx="35" ry="45" class="body-part" data-part="head" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Neck (back) -->
                <rect x="135" y="100" width="30" height="20" class="body-part" data-part="neck" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Back -->
                <rect x="120" y="120" width="60" height="150" rx="10" class="body-part" data-part="back" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Arms (back) -->
                <rect x="70" y="140" width="25" height="120" rx="12" class="body-part" data-part="left-arm" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <rect x="205" y="140" width="25" height="120" rx="12" class="body-part" data-part="right-arm" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Hands (back) -->
                <ellipse cx="82" cy="275" rx="15" ry="20" class="body-part" data-part="left-hand" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <ellipse cx="218" cy="275" rx="15" ry="20" class="body-part" data-part="right-hand" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Legs (back) -->
                <rect x="130" y="270" width="20" height="150" rx="10" class="body-part" data-part="left-leg" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <rect x="150" y="270" width="20" height="150" rx="10" class="body-part" data-part="right-leg" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Feet (back) -->
                <ellipse cx="140" cy="435" rx="12" ry="18" class="body-part" data-part="left-foot" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <ellipse cx="160" cy="435" rx="12" ry="18" class="body-part" data-part="right-foot" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                
                <!-- Labels -->
                <text x="150" y="65" text-anchor="middle" font-size="10" fill="#666">Head</text>
                <text x="150" y="195" text-anchor="middle" font-size="10" fill="#666">Back</text>
                <text x="82" y="200" text-anchor="middle" font-size="8" fill="#666">L.Arm</text>
                <text x="218" y="200" text-anchor="middle" font-size="8" fill="#666">R.Arm</text>
                <text x="140" y="350" text-anchor="middle" font-size="8" fill="#666">L.Leg</text>
                <text x="160" y="350" text-anchor="middle" font-size="8" fill="#666">R.Leg</text>
            </svg>
        `;
    }

    initializeBodyInteractions(modal) {
        // View switcher
        const viewBtns = modal.querySelectorAll('.view-btn');
        const bodyViews = modal.querySelectorAll('.body-view');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                
                // Update active states
                viewBtns.forEach(b => b.classList.remove('active'));
                bodyViews.forEach(v => v.classList.remove('active'));
                
                btn.classList.add('active');
                modal.querySelector(`[data-view="${view}"].body-view`).classList.add('active');
            });
        });

        // Body part interactions
        const bodyParts = modal.querySelectorAll('.body-part');
        bodyParts.forEach(part => {
            part.addEventListener('click', (e) => {
                const partName = e.target.dataset.part;
                this.toggleBodyPart(partName, e.target);
                this.updateSelectedAreasList();
            });

            part.addEventListener('mouseenter', (e) => {
                if (!this.selectedAreas.has(e.target.dataset.part)) {
                    e.target.style.fill = '#e0e0e0';
                }
            });

            part.addEventListener('mouseleave', (e) => {
                if (!this.selectedAreas.has(e.target.dataset.part)) {
                    e.target.style.fill = '#f0f0f0';
                }
            });
        });
    }

    toggleBodyPart(partName, element) {
        if (this.selectedAreas.has(partName)) {
            // Deselect
            this.selectedAreas.delete(partName);
            element.style.fill = '#f0f0f0';
            element.classList.remove('selected');
        } else {
            // Select
            this.selectedAreas.add(partName);
            element.style.fill = this.bodyParts[partName]?.color || '#ff6b6b';
            element.classList.add('selected');
        }

        // Update all instances of this body part (front and back views)
        document.querySelectorAll(`[data-part="${partName}"]`).forEach(part => {
            if (this.selectedAreas.has(partName)) {
                part.style.fill = this.bodyParts[partName]?.color || '#ff6b6b';
                part.classList.add('selected');
            } else {
                part.style.fill = '#f0f0f0';
                part.classList.remove('selected');
            }
        });
    }

    updateSelectedAreasList() {
        const listContainer = document.getElementById('selectedAreasList');
        const intensitySection = document.querySelector('.pain-intensity-section');
        const intensityControls = document.getElementById('intensityControls');

        if (this.selectedAreas.size === 0) {
            listContainer.innerHTML = '<p class="no-selection">Click on body parts to select symptom locations</p>';
            intensitySection.style.display = 'none';
            return;
        }

        // Show selected areas
        const selectedList = Array.from(this.selectedAreas).map(partName => {
            const partInfo = this.bodyParts[partName];
            return `
                <div class="selected-area-item">
                    <span class="area-color" style="background-color: ${partInfo?.color || '#ff6b6b'}"></span>
                    <span class="area-name">${partInfo?.name || partName}</span>
                    <button class="remove-area" onclick="window.bodyDiagram.removeBodyPart('${partName}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = selectedList;

        // Show pain intensity controls
        intensitySection.style.display = 'block';
        intensityControls.innerHTML = Array.from(this.selectedAreas).map(partName => {
            const partInfo = this.bodyParts[partName];
            return `
                <div class="intensity-control">
                    <label>${partInfo?.name || partName} Pain Level:</label>
                    <div class="intensity-slider-container">
                        <input type="range" min="0" max="10" value="5" class="intensity-slider" data-part="${partName}">
                        <span class="intensity-value">5</span>
                    </div>
                </div>
            `;
        }).join('');

        // Initialize intensity sliders
        intensityControls.querySelectorAll('.intensity-slider').forEach(slider => {
            const valueDisplay = slider.parentElement.querySelector('.intensity-value');
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
            });
        });
    }

    removeBodyPart(partName) {
        this.selectedAreas.delete(partName);
        
        // Update visual state
        document.querySelectorAll(`[data-part="${partName}"]`).forEach(part => {
            part.style.fill = '#f0f0f0';
            part.classList.remove('selected');
        });

        this.updateSelectedAreasList();
    }

    saveSelection() {
        if (this.selectedAreas.size === 0) {
            alert('Please select at least one body area');
            return;
        }

        const selectedData = {
            areas: Array.from(this.selectedAreas),
            intensities: {},
            description: document.getElementById('symptomDescription').value
        };

        // Collect intensity data
        document.querySelectorAll('.intensity-slider').forEach(slider => {
            selectedData.intensities[slider.dataset.part] = parseInt(slider.value);
        });

        // Update the original form field
        if (this.currentFieldId) {
            const fieldContainer = document.getElementById(this.currentFieldId);
            if (fieldContainer) {
                const selectedContainer = fieldContainer.querySelector(`#${this.currentFieldId}-selected`);
                if (selectedContainer) {
                    selectedContainer.innerHTML = `
                        <div class="body-selection-summary">
                            <h4>Selected Areas:</h4>
                            ${selectedData.areas.map(area => {
                                const partInfo = this.bodyParts[area];
                                const intensity = selectedData.intensities[area] || 0;
                                return `
                                    <div class="selected-summary-item">
                                        <span class="area-color" style="background-color: ${partInfo?.color}"></span>
                                        <span>${partInfo?.name}</span>
                                        <span class="intensity-badge">Pain: ${intensity}/10</span>
                                    </div>
                                `;
                            }).join('')}
                            ${selectedData.description ? `<p class="symptom-desc"><strong>Description:</strong> ${selectedData.description}</p>` : ''}
                        </div>
                    `;
                }
            }
        }

        // Close modal
        document.querySelector('.body-diagram-modal').remove();

        // Show success notification
        if (window.teleMedApp && window.teleMedApp.showNotification) {
            window.teleMedApp.showNotification(`Selected ${selectedData.areas.length} body area(s) for symptom analysis`, 'success');
        }
    }
}

// Initialize body diagram
window.bodyDiagram = new InteractiveBodyDiagram();