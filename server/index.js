require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store
const users = []; 
const otpStore = new Map(); // email -> { otp, expires, tempData }

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Send Email with Console Fallback
const sendEmail = async (email, otp) => {
    console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`); // ALWAYS print to console for local testing
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[WARN] Email credentials missing in .env. OTP not sent via email.");
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Hunt360 Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hunt360 Verification</h2>
                    <p>Your One-Time Password (OTP) is:</p>
                    <h1 style="color: #6D28D9; letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                </div>
            `
        });
        console.log(`[SUCCESS] Email sent to ${email}`);
    } catch (error) {
        console.error("[ERROR] Failed to send email:", error.message);
        // We don't throw error here so the UI flow doesn't break, user can use console OTP
    }
};

// 1. Signup Step 1: Validate & Send OTP
app.post('/api/auth/signup-init', async (req, res) => {
    const { username, email, password, captchaToken } = req.body;

    // Basic Validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Mock Captcha Check
    if (!captchaToken) {
        return res.status(400).json({ message: "Please complete the captcha" });
    }

    // Password Policy
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: "Password must be 8+ chars, with Uppercase, Lowercase, Number, and Special char." 
        });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const otp = generateOTP();
    
    // Store temp data (including username) until OTP is verified
    otpStore.set(email, { 
        otp, 
        tempData: { username, email, password: await bcrypt.hash(password, 10) },
        expires: Date.now() + 300000 // 5 mins
    });

    await sendEmail(email, otp);
    res.json({ message: "OTP sent. Check your email or console." });
});

// 2. Signup Step 2: Verify OTP & Create Account
app.post('/api/auth/signup-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record) return res.status(400).json({ message: "Session expired. Signup again." });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP Expired" });

    // Create User with Username
    const newUser = { 
        id: users.length + 1, 
        username: record.tempData.username,
        email: record.tempData.email, 
        password: record.tempData.password 
    };
    
    users.push(newUser);
    otpStore.delete(email);

    const token = jwt.sign({ email, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email, username: newUser.username } });
});

// 3. Login Step 1: Check Creds & Send MFA
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate MFA OTP
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 300000 });
    
    await sendEmail(email, otp);
    res.json({ message: "MFA OTP sent", mfaRequired: true });
});

// 4. Login Step 2: Verify MFA
app.post('/api/auth/login-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    const user = users.find(u => u.email === email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);
    const token = jwt.sign({ email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email, username: user.username } });
});

const PORT = process.env.PORT || 5000;

// Only listen if not running on Vercel (allows local dev to still work)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;