const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const SignupModel = require('../models/signup');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

// Initialize OAuth client with the correct client ID
const GOOGLE_CLIENT_ID = "70701411090-qn40im1n8qi1773qdd4qt7sv8d0db4kb.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware to verify Google token
const verifyGoogleToken = async (req, res, next) => {
    console.log('\n=== Google Token Verification Started ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { credential } = req.body;

    if (!credential) {
        console.log('❌ No credential provided in request');
        return res.status(400).json({
            success: false,
            message: 'No credential provided'
        });
    }

    console.log('✅ Credential received, length:', credential.length);
    console.log('Credential preview:', credential.substring(0, 50) + '...');
    console.log('Client ID being used:', GOOGLE_CLIENT_ID);

    try {
        console.log('🔍 Attempting to verify token with Google...');

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });

        console.log('✅ Token verified successfully');
        const payload = ticket.getPayload();
        console.log('Token payload received:', JSON.stringify(payload, null, 2));

        req.googlePayload = payload;
        console.log('=== Token Verification Completed Successfully ===\n');
        next();
    } catch (error) {
        console.log('❌ Token verification failed');
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Full error:', error);
        console.log('Error stack:', process.env.NODE_ENV === 'development' ? error.stack : 'Set NODE_ENV=development for full stack');
        console.log('=== Token Verification Failed ===\n');

        res.status(401).json({
            success: false,
            message: 'Invalid Google token',
            error: error.message,
            errorDetails: {
                name: error.name,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
};

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/profile-photos'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Google login/signup endpoint
router.post('/google-login', verifyGoogleToken, async (req, res) => {
    try {
        console.log('Full Google payload:', JSON.stringify(req.googlePayload, null, 2));

        const payload = req.googlePayload;
        const email = payload.email;
        const googleId = payload.sub;

        let user = await SignupModel.findOne({ $or: [{ email }, { googleId }] });

        if (!user) {
            // Extract names with multiple fallback strategies
            let firstName = 'User';
            let lastName = 'Name';

            // Strategy 1: Use given_name and family_name if available
            if (payload.given_name && payload.given_name.trim()) {
                firstName = payload.given_name.trim();
            }
            if (payload.family_name && payload.family_name.trim()) {
                lastName = payload.family_name.trim();
            }

            // Strategy 2: If no given_name/family_name, try to parse 'name' field
            if ((firstName === 'User' || lastName === 'Name') && payload.name && payload.name.trim()) {
                const nameParts = payload.name.trim().split(/\s+/);
                if (nameParts.length >= 2) {
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ');
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0];
                    lastName = nameParts[0]; // Use same name for both
                }
            }

            // Strategy 3: Final fallback - use email username
            if (firstName === 'User' && email) {
                const emailUsername = email.split('@')[0];
                firstName = emailUsername;
                if (lastName === 'Name') {
                    lastName = emailUsername;
                }
            }

            console.log('Final name extraction result:', {
                firstName,
                lastName,
                originalPayload: {
                    name: payload.name,
                    given_name: payload.given_name,
                    family_name: payload.family_name
                }
            });

            const userData = {
                email,
                firstName,
                lastName,
                photo: payload.picture || '',
                username: email.split('@')[0],
                googleId,
                provider: 'google',
                profileCompleted: false
            };

            console.log('📊 Creating new user with data:', JSON.stringify(userData, null, 2));

            try {
                user = new SignupModel(userData);
                console.log('🔄 Attempting to save user to database...');
                await user.save();
                console.log('✅ User created successfully with ID:', user._id);
            } catch (saveError) {
                console.log('❌ Error saving user to database:');
                console.log('Save error name:', saveError.name);
                console.log('Save error message:', saveError.message);
                console.log('Save error details:', JSON.stringify(saveError, null, 2));
                throw saveError; // Re-throw to be caught by outer catch
            }
        } else if (!user.googleId) {
            console.log('🔄 Updating existing user with Google ID and names...');

            // Extract names for the existing user too
            let firstName = user.firstName || 'User';
            let lastName = user.lastName || 'Name';

            // Strategy 1: Use given_name and family_name if available
            if (payload.given_name && payload.given_name.trim()) {
                firstName = payload.given_name.trim();
            }
            if (payload.family_name && payload.family_name.trim()) {
                lastName = payload.family_name.trim();
            }

            // Strategy 2: If no given_name/family_name, try to parse 'name' field
            if ((firstName === 'User' || lastName === 'Name') && payload.name && payload.name.trim()) {
                const nameParts = payload.name.trim().split(/\s+/);
                if (nameParts.length >= 2) {
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ');
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0];
                    lastName = nameParts[0];
                }
            }

            // Strategy 3: Final fallback - use email username
            if (firstName === 'User' && email) {
                const emailUsername = email.split('@')[0];
                firstName = emailUsername;
                if (lastName === 'Name') {
                    lastName = emailUsername;
                }
            }

            console.log('📝 Updating existing user with:', {
                firstName,
                lastName,
                googleId,
                provider: 'google'
            });

            try {
                user.firstName = firstName;
                user.lastName = lastName;
                user.googleId = googleId;
                user.provider = 'google';
                if (payload.picture && !user.photo) {
                    user.photo = payload.picture;
                }
                await user.save();
                console.log('✅ Existing user updated with Google ID and names');
            } catch (updateError) {
                console.log('❌ Error updating existing user:');
                console.log('Update error:', updateError);
                throw updateError;
            }
        } else {
            console.log('✅ User already exists with Google ID, no changes needed');
        }

        console.log('🎉 Sending successful response...');
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                photo: user.photo,
                profileCompleted: user.profileCompleted
            }
        });
    } catch (error) {
        console.log('\n❌ === GOOGLE LOGIN ERROR OCCURRED ===');
        console.log('Error type:', typeof error);
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);

        // Special handling for MongoDB/Mongoose errors
        if (error.name === 'ValidationError') {
            console.log('🔍 Mongoose Validation Error Details:');
            console.log('Validation errors:', JSON.stringify(error.errors, null, 2));
        }

        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            console.log('🔍 MongoDB Error Details:');
            console.log('MongoDB error code:', error.code);
        }

        console.log('📍 Full error stack:', error.stack);
        console.log('🔍 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.log('=== END GOOGLE LOGIN ERROR ===\n');

        res.status(500).json({
            success: false,
            message: 'Server error during Google login',
            error: error.message,
            errorDetails: {
                name: error.name,
                code: error.code,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                validationErrors: error.name === 'ValidationError' ? error.errors : undefined
            }
        });
    }
});

// Check authentication status
router.get('/check-auth', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const user = await SignupModel.findOne({ email: payload.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            isAuthenticated: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                photo: user.photo,
                profileCompleted: user.profileCompleted
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
            isAuthenticated: false
        });
    }
});

// Get user profile by email
router.get('/profile', async (req, res) => {
    const email = req.query.email;
    console.log('📥 GET /profile - Email:', email);

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await SignupModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ Profile found for:', email);
        res.json(user);
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
router.put('/profile', upload.single('photo'), async (req, res) => {
    console.log('📥 PUT /profile - Body:', req.body);
    console.log('📥 PUT /profile - File:', req.file);

    const { email, firstName, lastName, username, bio, gender } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const updateData = {
            firstName,
            lastName,
            username,
            bio,
            gender,
            profileCompleted: true,
            updatedAt: new Date()
        };

        if (req.file) {
            updateData.photo = `/uploads/profile-photos/${req.file.filename}`;
            console.log('📸 Photo uploaded:', updateData.photo);
        }

        console.log('🔄 Updating profile with data:', updateData);

        const updatedUser = await SignupModel.findOneAndUpdate(
            { email },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ Profile updated successfully for:', email);
        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                bio: updatedUser.bio,
                gender: updatedUser.gender,
                photo: updatedUser.photo,
                profileCompleted: updatedUser.profileCompleted
            }
        });
    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Google profile completion endpoint (for GoogleNameForm)
router.post('/google-register', async (req, res) => {
    console.log('📥 POST /google-register - Body:', req.body);

    const { name, phoneNumber, email } = req.body;

    if (!name || !phoneNumber || !email) {
        return res.status(400).json({
            message: 'Name, phone number, and email are required'
        });
    }

    try {
        // Parse name into firstName and lastName
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

        console.log('🔄 Updating Google user profile completion...');

        const updatedUser = await SignupModel.findOneAndUpdate(
            { email },
            {
                firstName,
                lastName,
                phone: phoneNumber,
                profileCompleted: true,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ Google profile completion successful for:', email);
        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                profileCompleted: updatedUser.profileCompleted
            }
        });
    } catch (error) {
        console.error('❌ Google profile completion error:', error);
        res.status(500).json({
            message: 'Failed to complete profile',
            error: error.message
        });
    }
});

module.exports = router;
