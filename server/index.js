const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SignupModel = require('./models/signup'); // Your SignupModel

// Google Client ID for debugging
const GOOGLE_CLIENT_ID = "70701411090-qn40im1n8qi1773qdd4qt7sv8d0db4kb.apps.googleusercontent.com";

// Ensure 'uploads' folder exists
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);  // Create the folder if it doesn't exist
}

// Initialize Express app
const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`\n📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Response logging middleware
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        console.log(`📤 ${req.method} ${req.path} - Status: ${res.statusCode}`);
        if (res.statusCode >= 400) {
            console.log('Error Response:', data);
        }
        originalSend.call(this, data);
    };
    next();
});

// Import routes
const authRoutes = require('./routes/auth');

// Campaign model
const Campaign = require('./models/campaign');

// Use routes
app.use('/auth', authRoutes);

// --------------------------------
// ✅ CAMPAIGN ROUTES
// --------------------------------

// Get all campaigns
app.get('/campaigns', async (req, res) => {
    try {
        console.log('📥 GET /campaigns - Fetching all campaigns');
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        console.log(`✅ Found ${campaigns.length} campaigns`);
        res.json(campaigns);
    } catch (error) {
        console.error('❌ Error fetching campaigns:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Create a new campaign
app.post('/campaigns', async (req, res) => {
    try {
        console.log('📥 POST /campaigns - Creating new campaign');
        console.log('Request body:', req.body);

        const { title, amount, photoUrls, description, email, username } = req.body;

        if (!title || !amount || !description || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, amount, description, email'
            });
        }

        const campaign = new Campaign({
            title,
            amount: Number(amount),
            photoUrls: photoUrls || [],
            description,
            email,
            username
        });

        const savedCampaign = await campaign.save();
        console.log('✅ Campaign created successfully:', savedCampaign._id);

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            campaign: savedCampaign
        });
    } catch (error) {
        console.error('❌ Error creating campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create campaign',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    console.log('✅ Test endpoint called');
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test MongoDB connection
        await mongoose.connection.db.admin().ping();

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {
                server: 'Running',
                mongodb: {
                    status: 'Connected',
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                    database: mongoose.connection.name,
                    readyState: mongoose.connection.readyState
                },
                google: {
                    clientId: GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Set up multer for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);  // Specify upload folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext;
        cb(null, filename);  // Store file with a timestamp
    }
});
const upload = multer({ storage: storage });

// Profile routes are handled in /auth routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Connect to MongoDB & start the server
console.log('🔄 Attempting to connect to MongoDB...');
mongoose.connect('mongodb://localhost:27017/gofundme')
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log('📊 MongoDB connection details:');
        console.log('  - Host:', mongoose.connection.host);
        console.log('  - Port:', mongoose.connection.port);
        console.log('  - Database:', mongoose.connection.name);
        console.log('  - Ready State:', mongoose.connection.readyState);

        // Test database connection with a simple query
        mongoose.connection.db.admin().ping()
            .then(() => console.log('✅ MongoDB ping successful'))
            .catch(err => console.log('❌ MongoDB ping failed:', err));

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('� Environment:', process.env.NODE_ENV || 'development');
            console.log('🔑 Google Client ID configured:', GOOGLE_CLIENT_ID ? 'Yes' : 'No');
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Full MongoDB error:', err);
        process.exit(1);
    });
