const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SignupModel = require('./models/signup'); // Your SignupModel
const CampaignModel = require('./models/campaign'); // Campaign model
const authRoutes = require('./routes/auth'); // Auth routes

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
    origin: function (origin, callback) {
        console.log(`🌐 CORS request from origin: ${origin}`);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('✅ CORS: No origin - allowing request');
            return callback(null, true);
        }

        // Allow any localhost or 127.0.0.1 with any port
        const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

        if (localhostRegex.test(origin)) {
            console.log('✅ CORS: Localhost origin allowed:', origin);
            return callback(null, true);
        }

        // For development, you can also allow specific domains
        const allowedOrigins = [
            'http://localhost',
            'https://localhost',
            'http://127.0.0.1',
            'https://127.0.0.1'
        ];

        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            console.log('✅ CORS: Origin allowed:', origin);
            return callback(null, true);
        }

        console.log('❌ CORS: Origin not allowed:', origin);
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
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
            console.log('Error Response:', data.substring(0, 200));
        }
        originalSend.call(this, data);
    };
    next();
});

// Mount auth routes
app.use('/auth', authRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Server is working!' });
});

// Debug route to list users (for development only)
app.get('/debug/users', async (req, res) => {
    try {
        const users = await SignupModel.find({}, { email: 1, firstName: 1, lastName: 1, provider: 1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Debug route to delete test users (for development only)
app.delete('/debug/test-users', async (req, res) => {
    try {
        const result = await SignupModel.deleteMany({
            email: { $regex: /test|demo|example/i }
        });
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} test users`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Manual Registration Route
app.post('/register', async (req, res) => {
    console.log('📥 POST /register - Body:', req.body);

    try {
        const { firstName, lastName, gender, dob, email, password } = req.body;
        console.log(`🔍 Registration attempt for email: ${email}`);

        // Validation
        if (!firstName || !lastName || !email || !password) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Check if user already exists
        console.log(`🔎 Checking if user exists with email: ${email}`);
        const existingUser = await SignupModel.findOne({ email });

        if (existingUser) {
            console.log(`❌ User already exists:`, {
                email: existingUser.email,
                firstName: existingUser.firstName,
                provider: existingUser.provider,
                createdAt: existingUser.createdAt
            });
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        console.log('✅ Email is available, proceeding with registration');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('✅ Password hashed successfully');

        // Create new user
        const newUser = new SignupModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            gender: gender || '',
            dob: dob || null,
            provider: 'local',
            profileCompleted: true // Manual registration completes profile
        });

        console.log('💾 Saving new user to database...');
        const savedUser = await newUser.save();
        console.log('✅ User registered successfully:', {
            id: savedUser._id,
            email: savedUser.email,
            name: `${savedUser.firstName} ${savedUser.lastName}`
        });

        res.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: savedUser._id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);

        // Check if it's a duplicate key error (MongoDB unique constraint)
        if (error.code === 11000) {
            console.log('❌ MongoDB duplicate key error - user already exists');
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Manual Login Route
app.post('/login', async (req, res) => {
    console.log('📥 POST /login - Body:', req.body);

    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await SignupModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user registered with Google (no password)
        if (user.provider === 'google' && !user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account was created with Google. Please use Google Sign-In.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ User logged in successfully:', email);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profileCompleted: user.profileCompleted
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Campaign Routes
app.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await CampaignModel.find().sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        console.error('❌ Error fetching campaigns:', error);
        res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
    }
});

app.post('/campaigns', async (req, res) => {
    try {
        console.log('📥 POST /campaigns - Body:', req.body);
        const { title, amount, photoUrls, description, email, username } = req.body;

        if (!title || !amount || !description) {
            return res.status(400).json({ message: 'Title, amount, and description are required' });
        }

        const campaign = new CampaignModel({
            title,
            amount,
            photoUrls: photoUrls || [],
            description,
            email: email || '',
            username: username || 'Anonymous'
        });

        await campaign.save();
        console.log('✅ Campaign created successfully:', campaign._id);
        res.status(201).json(campaign);
    } catch (error) {
        console.error('❌ Error creating campaign:', error);
        res.status(500).json({ message: 'Error creating campaign', error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
    console.log(`❌ Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// MongoDB Connection
console.log('🔄 Attempting to connect to MongoDB...');
mongoose.connect("mongodb://localhost:27017/gofundme")
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        console.log("📊 MongoDB connection details:");
        console.log("  - Host: localhost");
        console.log("  - Port: 27017");
        console.log("  - Database: gofundme");
        console.log("  - Ready State:", mongoose.connection.readyState);

        // Test the connection
        mongoose.connection.db.admin().ping()
            .then(() => console.log("✅ MongoDB ping successful"))
            .catch(err => console.log("❌ MongoDB ping failed:", err));
    })
    .catch(err => {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    });

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Google Client ID configured: ${GOOGLE_CLIENT_ID ? 'Yes' : 'No'}`);
});
