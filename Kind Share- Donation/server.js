require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kindshare', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Models
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    points: { type: Number, default: 0 },
    badges: [String],
    resetToken: String,
    resetTokenExpiry: Date
});

const donationSchema = new mongoose.Schema({
    category: String,
    description: String,
    images: [String],
    donor: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'scheduled', 'collected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Donation = mongoose.model('Donation', donationSchema);

// File Upload Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, 'donation-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
}).array('images', 5);

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        // Check if email or phone already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or phone number already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });
        await user.save();
        
        // Create token for auto-login after registration
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        
        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { name: user.name, points: user.points, badges: user.badges }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password, rememberMe } = req.body;
        
        // Check if identifier is email or phone
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Set token expiration based on remember me option
        const expiresIn = rememberMe ? '30d' : '24h';
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn }
        );
        
        res.json({ 
            token, 
            user: { 
                name: user.name, 
                email: user.email,
                phone: user.phone,
                points: user.points, 
                badges: user.badges 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/donations', upload, async (req, res) => {
    try {
        const { category, description, name, email, phone, address } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`);
        
        const donation = new Donation({
            category,
            description,
            images,
            donor: { name, email, phone, address }
        });
        
        await donation.save();

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Donation Request Received - KindShare',
            html: `
                <h2>Thank you for your donation!</h2>
                <p>We have received your donation request for ${category} items.</p>
                <p>Our team will review your submission and contact you soon.</p>
                <p>Donation ID: ${donation._id}</p>
                <p>Track your donation status on our website.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'Donation submitted successfully',
            donationId: donation._id
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit donation' });
    }
});

app.get('/api/donations/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donation' });
    }
});

app.put('/api/donations/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        // Send email notification for status update
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: donation.donor.email,
            subject: 'Donation Status Update - KindShare',
            html: `
                <h2>Donation Status Update</h2>
                <p>Your donation (ID: ${donation._id}) status has been updated to: ${status}</p>
                <p>Category: ${donation.category}</p>
                ${status === 'approved' ? '<p>Our team will contact you soon to schedule the pickup.</p>' : ''}
                ${status === 'scheduled' ? '<p>Our agent will arrive at the scheduled time for pickup.</p>' : ''}
                ${status === 'collected' ? '<p>Thank you for your generous donation!</p>' : ''}
            `
        };

        await transporter.sendMail(mailOptions);

        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update donation status' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments();
        const livesImpacted = totalDonations * 5; // Assuming each donation helps 5 people
        const activeDonors = await Donation.distinct('donor.email').length;
        
        res.json({
            totalDonations,
            livesImpacted,
            activeDonors
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Forgot password route
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { identifier, type } = req.body;
        
        // Find user by email or phone
        const user = await User.findOne({
            [type === 'email' ? 'email' : 'phone']: identifier
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Generate random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set token expiry (1 hour)
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();
        
        if (type === 'email') {
            // Send email with reset link
            const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset - KindShare',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your KindShare account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:4px;">Reset Password</a>
                    <p>This link is valid for 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };
            
            await transporter.sendMail(mailOptions);
        } else {
            // For phone, we would typically send an SMS
            // This is a placeholder for SMS integration
            console.log(`SMS reset link sent to ${user.phone} with token: ${resetToken}`);
            // In a real implementation, you would integrate with an SMS service like Twilio
        }
        
        res.json({ message: `Password reset link sent to your ${type}` });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset password route
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Find user with valid token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        
        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get current user route
app.get('/api/user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});