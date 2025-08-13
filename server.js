// TeleMed Backend API Server
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://vrathanpriyan:@saran1812@cluster0.5fwqb3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'telemed';

let db;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB Atlas');
        
        // Create indexes for better performance
        await createIndexes();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

async function createIndexes() {
    try {
        // Patient indexes
        await db.collection('patients').createIndex({ patientId: 1 }, { unique: true });
        await db.collection('patients').createIndex({ email: 1 });
        
        // Consultation indexes
        await db.collection('consultations').createIndex({ patientId: 1 });
        await db.collection('consultations').createIndex({ timestamp: -1 });
        await db.collection('consultations').createIndex({ featureType: 1 });
        
        // Medical records indexes
        await db.collection('medicalRecords').createIndex({ patientId: 1 });
        await db.collection('medicalRecords').createIndex({ createdAt: -1 });
        
        // Analytics indexes
        await db.collection('analytics').createIndex({ patientId: 1 });
        await db.collection('analytics').createIndex({ timestamp: -1 });
        await db.collection('analytics').createIndex({ eventType: 1 });
        
        console.log('Database indexes created');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Patient Management Routes
app.post('/api/patients', async (req, res) => {
    try {
        const patientData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('patients').insertOne(patientData);
        res.json({ 
            success: true, 
            data: { ...patientData, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/patients/:patientId', async (req, res) => {
    try {
        const patient = await db.collection('patients').findOne({ 
            patientId: req.params.patientId 
        });
        
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        res.json({ success: true, data: patient });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/patients/:patientId', async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        
        const result = await db.collection('patients').updateOne(
            { patientId: req.params.patientId },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        res.json({ success: true, data: updateData });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Consultation Management Routes
app.post('/api/consultations', async (req, res) => {
    try {
        const consultationData = {
            ...req.body,
            timestamp: new Date(),
            createdAt: new Date()
        };
        
        const result = await db.collection('consultations').insertOne(consultationData);
        res.json({ 
            success: true, 
            data: { ...consultationData, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Error saving consultation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/consultations/patient/:patientId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const consultations = await db.collection('consultations')
            .find({ patientId: req.params.patientId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
        
        res.json({ success: true, data: consultations });
    } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Medical Records Routes
app.post('/api/medical-records', async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            createdAt: new Date()
        };
        
        const result = await db.collection('medicalRecords').insertOne(recordData);
        res.json({ 
            success: true, 
            data: { ...recordData, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Error saving medical record:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/medical-records/patient/:patientId', async (req, res) => {
    try {
        const records = await db.collection('medicalRecords')
            .find({ patientId: req.params.patientId })
            .sort({ createdAt: -1 })
            .toArray();
        
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Image Upload and Analysis Routes
app.post('/api/images', upload.single('image'), async (req, res) => {
    try {
        const metadata = JSON.parse(req.body.metadata);
        const imageData = {
            ...metadata,
            imageBuffer: req.file.buffer,
            uploadedAt: new Date()
        };
        
        const result = await db.collection('imageAnalyses').insertOne(imageData);
        res.json({ 
            success: true, 
            data: { ...metadata, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Error saving image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/images/patient/:patientId', async (req, res) => {
    try {
        const images = await db.collection('imageAnalyses')
            .find({ patientId: req.params.patientId })
            .sort({ uploadedAt: -1 })
            .toArray();
        
        // Remove image buffers from response for performance
        const imagesWithoutBuffers = images.map(img => {
            const { imageBuffer, ...imageWithoutBuffer } = img;
            return imageWithoutBuffer;
        });
        
        res.json({ success: true, data: imagesWithoutBuffers });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analytics Routes
app.post('/api/analytics', async (req, res) => {
    try {
        const analyticsData = {
            ...req.body,
            timestamp: new Date()
        };
        
        const result = await db.collection('analytics').insertOne(analyticsData);
        res.json({ 
            success: true, 
            data: { ...analyticsData, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Error saving analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const { patientId, startDate, endDate, eventType } = req.query;
        const query = {};
        
        if (patientId) query.patientId = patientId;
        if (eventType) query.eventType = eventType;
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const analytics = await db.collection('analytics')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(1000)
            .toArray();
        
        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Authentication Routes (Simple implementation)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // In production, use proper password hashing
        const user = await db.collection('patients').findOne({ 
            email: email,
            password: password // This should be hashed in production
        });
        
        if (user) {
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            res.json({ 
                success: true, 
                user: userWithoutPassword,
                token: 'simple-token-' + user._id // In production, use JWT
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
app.post('/api/sync', async (req, res) => {
    try {
        const { patients, consultations, medicalRecords, imageAnalyses, analytics } = req.body;
        
        // Sync patients
        if (patients && Object.keys(patients).length > 0) {
            const patientOps = Object.values(patients).map(patient => ({
                updateOne: {
                    filter: { patientId: patient.patientId },
                    update: { $set: patient },
                    upsert: true
                }
            }));
            await db.collection('patients').bulkWrite(patientOps);
        }
        
        // Sync consultations
        if (consultations && Object.keys(consultations).length > 0) {
            const consultationOps = Object.values(consultations).map(consultation => ({
                updateOne: {
                    filter: { consultationId: consultation.consultationId },
                    update: { $set: consultation },
                    upsert: true
                }
            }));
            await db.collection('consultations').bulkWrite(consultationOps);
        }
        
        // Sync medical records
        if (medicalRecords && Object.keys(medicalRecords).length > 0) {
            const recordOps = Object.values(medicalRecords).map(record => ({
                updateOne: {
                    filter: { recordId: record.recordId },
                    update: { $set: record },
                    upsert: true
                }
            }));
            await db.collection('medicalRecords').bulkWrite(recordOps);
        }
        
        // Sync analytics
        if (analytics && Object.keys(analytics).length > 0) {
            const analyticsOps = Object.values(analytics).map(event => ({
                updateOne: {
                    filter: { eventId: event.eventId },
                    update: { $set: event },
                    upsert: true
                }
            }));
            await db.collection('analytics').bulkWrite(analyticsOps);
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
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const stats = await Promise.all([
            db.collection('patients').countDocuments(),
            db.collection('consultations').countDocuments(),
            db.collection('medicalRecords').countDocuments(),
            db.collection('imageAnalyses').countDocuments(),
            db.collection('consultations').aggregate([
                { $group: { _id: '$featureType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).toArray()
        ]);
        
        res.json({
            success: true,
            data: {
                totalPatients: stats[0],
                totalConsultations: stats[1],
                totalMedicalRecords: stats[2],
                totalImageAnalyses: stats[3],
                consultationsByFeature: stats[4]
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
async function startServer() {
    await connectToDatabase();
    
    app.listen(PORT, () => {
        console.log(`TeleMed API Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}

startServer().catch(console.error);