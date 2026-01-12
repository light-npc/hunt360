require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store (Remember: This wipes on restart!)
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

const sendEmail = async (email, otp, subject) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[DEBUG] OTP for ${email}: ${otp}`); // Log to console if no email config
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h3>${subject}</h3>
                    <p>Your verification code is:</p>
                    <h1 style="color: #2563EB; letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                </div>
            `
        });
        console.log(`[SUCCESS] Email sent to ${email}`);
    } catch (error) {
        console.error("Email error:", error);
    }
};

// --- ROUTES ---

// 1. Signup Init
app.post('/api/auth/signup-init', async (req, res) => {
    const { fullName, email, password, department, countryCode, phoneNumber } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const otp = generateOTP();
    otpStore.set(email, { 
        otp, 
        tempData: { fullName, email, password: await bcrypt.hash(password, 10), department, fullPhone: `${countryCode} ${phoneNumber}` },
        expires: Date.now() + 300000 
    });

    await sendEmail(email, otp, 'Hunt360 Signup Verification');
    res.json({ message: "OTP sent" });
});

// 2. Signup Verify
app.post('/api/auth/signup-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const newUser = { id: users.length + 1, ...record.tempData };
    users.push(newUser);
    otpStore.delete(email);

    const token = jwt.sign({ email, fullName: newUser.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: newUser });
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    const user = users.find(u => u.email === identifier || u.fullName === identifier);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    otpStore.set(user.email, { otp, expires: Date.now() + 300000 });
    
    await sendEmail(user.email, otp, 'Hunt360 Login OTP');
    res.json({ message: "MFA OTP sent", email: user.email });
});

// 4. Login Verify
app.post('/api/auth/login-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    const user = users.find(u => u.email === email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);
    const token = jwt.sign({ email, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
});

// --- FORGOT PASSWORD (OTP BASED) ---

// 5. Forgot Password - Step 1: Send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    // If user doesn't exist, return 404 (This is the error you were seeing)
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    // 'type: reset' marks this OTP for password reset
    otpStore.set(email, { otp, expires: Date.now() + 300000, type: 'reset' });
    
    await sendEmail(email, otp, 'Reset Password Code');
    res.json({ message: "Reset code sent to email" });
});

// 6. Reset Password - Step 2: Verify OTP & Update Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);

    // Check OTP and ensure it was for reset
    if (!record || record.otp !== otp || record.type !== 'reset') {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return res.status(404).json({ message: "User not found" });

    // Update Password
    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    otpStore.delete(email);

    res.json({ message: "Password reset successfully. Please login." });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;