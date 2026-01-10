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
const otpStore = new Map(); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email, otp) => {
    console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Hunt360 Verification Code',
            html: `<h2>Your OTP is: <span style="color:purple">${otp}</span></h2>`
        });
    } catch (error) {
        console.error("Email error:", error);
    }
};

// Signup Init
app.post('/api/auth/signup-init', async (req, res) => {
    const { username, email, password, captchaToken } = req.body;
    
    // Check if email OR username already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) return res.status(400).json({ message: "Email or Username already taken" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password too weak." });
    }

    const otp = generateOTP();
    otpStore.set(email, { 
        otp, 
        tempData: { username, email, password: await bcrypt.hash(password, 10) },
        expires: Date.now() + 300000 
    });

    await sendEmail(email, otp);
    res.json({ message: "OTP sent" });
});

// Signup Verify
app.post('/api/auth/signup-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const newUser = { 
        id: users.length + 1, 
        username: record.tempData.username,
        email: record.tempData.email, 
        password: record.tempData.password 
    };
    users.push(newUser);
    otpStore.delete(email);

    const token = jwt.sign({ email, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email, username: newUser.username } });
});

// LOGIN (Modified for Username OR Email)
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body; // 'identifier' can be email or username

    // Find user by Email OR Username
    const user = users.find(u => u.email === identifier || u.username === identifier);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Always use the user's email for OTP, even if they logged in with username
    const otp = generateOTP();
    otpStore.set(user.email, { otp, expires: Date.now() + 300000 });
    
    await sendEmail(user.email, otp);
    
    // Return the email so the frontend knows where to verify the OTP
    res.json({ message: "MFA OTP sent", email: user.email });
});

// Login Verify
app.post('/api/auth/login-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    const user = users.find(u => u.email === email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);
    
    // Set token to expire in 7 days for "Remember Me" effect
    const token = jwt.sign({ email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, username: user.username } });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;