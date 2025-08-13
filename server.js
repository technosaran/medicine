// TeleMed Backend API Server - In-Memory Storage
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
const storage = {
    patients: new Map(),
    consultations: new Map(),
    medicalRecords: new Map(),
    imageAnalyses: new Map(),
    analytics: new Map()
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// File upload configuration
const multerStorage = multer.memoryStorage();
const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Utility functions
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function findByField(collection, field, value) {
    for (let [key, item] of collection) {
        if (item[field] === value) {
            return item;
        }
    }
    return null;
}

function findAllByField(collection, field, value) {
    const results = [];
    for (let [key, item] of collection) {
        if (item[field] === value) {
            results.push(item);
        }
    }
    return results;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        database: 'in-memory',
        timestamp: new Date().toISOString(),
        stats: {
            patients: storage.patients.size,
            consultations: storage.consultations.size,
            medicalRecords: storage.medicalRecords.size,
            imageAnalyses: storage.imageAnalyses.size,
            analytics: storage.analytics.size
        }
    });
});

// Patient Management Routes
app.post('/api/patients', (req, res) => {
    try {
        const patientId = req.body.patientId || generateId();
        const patientData = {
            ...req.body,
            patientId,
            _id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        storage.patients.set(patientId, patientData);
        res.json({ 
            success: true, 
            data: patientData
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/patients/:patientId', (req, res) => {
    try {
        const patient = storage.patients.get(req.params.patientId);
        
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        res.json({ success: true, data: patient });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/patients/:patientId', (req, res) => {
    try {
        const existingPatient = storage.patients.get(req.params.patientId);
        
        if (!existingPatient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        const updateData = {
            ...existingPatient,
            ...req.body,
            patientId: req.params.patientId,
            updatedAt: new Date()
        };
        
        storage.patients.set(req.params.patientId, updateData);
        res.json({ success: true, data: updateData });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Consultation Management Routes
app.post('/api/consultations', (req, res) => {
    try {
        const consultationId = req.body.consultationId || generateId();
        const consultationData = {
            ...req.body,
            consultationId,
            _id: generateId(),
            timestamp: new Date(),
            createdAt: new Date()
        };
        
        storage.consultations.set(consultationId, consultationData);
        res.json({ 
            success: true, 
            data: consultationData
        });
    } catch (error) {
        console.error('Error saving consultation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/consultations/patient/:patientId', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const consultations = findAllByField(storage.consultations, 'patientId', req.params.patientId);
        
        // Sort by timestamp descending and limit results
        const sortedConsultations = consultations
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
        
        res.json({ success: true, data: sortedConsultations });
    } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Medical Records Routes
app.post('/api/medical-records', (req, res) => {
    try {
        const recordId = req.body.recordId || generateId();
        const recordData = {
            ...req.body,
            recordId,
            _id: generateId(),
            createdAt: new Date()
        };
        
        storage.medicalRecords.set(recordId, recordData);
        res.json({ 
            success: true, 
            data: recordData
        });
    } catch (error) {
        console.error('Error saving medical record:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/medical-records/patient/:patientId', (req, res) => {
    try {
        const records = findAllByField(storage.medicalRecords, 'patientId', req.params.patientId);
        
        // Sort by creation date descending
        const sortedRecords = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({ success: true, data: sortedRecords });
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Image Upload and Analysis Routes
app.post('/api/images', upload.single('image'), (req, res) => {
    try {
        const metadata = JSON.parse(req.body.metadata);
        const imageId = generateId();
        const imageData = {
            ...metadata,
            imageId,
            _id: imageId,
            imageBuffer: req.file.buffer,
            uploadedAt: new Date()
        };
        
        storage.imageAnalyses.set(imageId, imageData);
        
        // Return metadata without buffer for response
        const { imageBuffer, ...responseData } = imageData;
        res.json({ 
            success: true, 
            data: responseData
        });
    } catch (error) {
        console.error('Error saving image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/images/patient/:patientId', (req, res) => {
    try {
        const images = findAllByField(storage.imageAnalyses, 'patientId', req.params.patientId);
        
        // Remove image buffers from response for performance
        const imagesWithoutBuffers = images
            .map(img => {
                const { imageBuffer, ...imageWithoutBuffer } = img;
                return imageWithoutBuffer;
            })
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        res.json({ success: true, data: imagesWithoutBuffers });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analytics Routes
app.post('/api/analytics', (req, res) => {
    try {
        const eventId = req.body.eventId || generateId();
        const analyticsData = {
            ...req.body,
            eventId,
            _id: eventId,
            timestamp: new Date()
        };
        
        storage.analytics.set(eventId, analyticsData);
        res.json({ 
            success: true, 
            data: analyticsData
        });
    } catch (error) {
        console.error('Error saving analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics', (req, res) => {
    try {
        const { patientId, startDate, endDate, eventType } = req.query;
        let analytics = Array.from(storage.analytics.values());
        
        // Apply filters
        if (patientId) {
            analytics = analytics.filter(event => event.patientId === patientId);
        }
        if (eventType) {
            analytics = analytics.filter(event => event.eventType === eventType);
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            analytics = analytics.filter(event => {
                const eventDate = new Date(event.timestamp);
                return eventDate >= start && eventDate <= end;
            });
        }
        
        // Sort by timestamp descending and limit to 1000
        analytics = analytics
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 1000);
        
        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Authentication Routes (Simple implementation)
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email and password
        const user = findByField(storage.patients, 'email', email);
        
        if (user && user.password === password) {
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            res.json({ 
                success: true, 
                user: userWithoutPassword,
                token: 'simple-token-' + user._id
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Data Synchronization Route
app.post('/api/sync', (req, res) => {
    try {
        const { patients, consultations, medicalRecords, imageAnalyses, analytics } = req.body;
        
        // Sync patients
        if (patients && Object.keys(patients).length > 0) {
            Object.values(patients).forEach(patient => {
                storage.patients.set(patient.patientId, patient);
            });
        }
        
        // Sync consultations
        if (consultations && Object.keys(consultations).length > 0) {
            Object.values(consultations).forEach(consultation => {
                storage.consultations.set(consultation.consultationId, consultation);
            });
        }
        
        // Sync medical records
        if (medicalRecords && Object.keys(medicalRecords).length > 0) {
            Object.values(medicalRecords).forEach(record => {
                storage.medicalRecords.set(record.recordId, record);
            });
        }
        
        // Sync analytics
        if (analytics && Object.keys(analytics).length > 0) {
            Object.values(analytics).forEach(event => {
                storage.analytics.set(event.eventId, event);
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Data synchronized successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error during sync:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Dashboard Statistics Route
app.get('/api/dashboard/stats', (req, res) => {
    try {
        // Calculate consultation stats by feature type
        const consultationsByFeature = {};
        for (let consultation of storage.consultations.values()) {
            const featureType = consultation.featureType || 'unknown';
            consultationsByFeature[featureType] = (consultationsByFeature[featureType] || 0) + 1;
        }
        
        // Convert to array format
        const consultationsByFeatureArray = Object.entries(consultationsByFeature)
            .map(([_id, count]) => ({ _id, count }))
            .sort((a, b) => b.count - a.count);
        
        res.json({
            success: true,
            data: {
                totalPatients: storage.patients.size,
                totalConsultations: storage.consultations.size,
                totalMedicalRecords: storage.medicalRecords.size,
                totalImageAnalyses: storage.imageAnalyses.size,
                consultationsByFeature: consultationsByFeatureArray
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`TeleMed API Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log('Using in-memory storage - data will not persist between restarts');
});