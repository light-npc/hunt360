require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store (Note: Data resets on server restart)
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

const sendEmail = async (email, otp, subject = 'Hunt360 Verification Code') => {
    console.log(`[DEBUG] OTP for ${email}: ${otp}`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: `<h2>Your Hunt360 Code is: <span style="color:purple">${otp}</span></h2><p>This code expires in 5 minutes.</p>`
        });
    } catch (error) {
        console.error("Email error:", error);
    }
};

// --- AUTH ROUTES ---

// 1. Signup Init
app.post('/api/auth/signup-init', async (req, res) => {
    const { username, email, password } = req.body;
    
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

    await sendEmail(email, otp, 'Welcome to Hunt360 - Signup OTP');
    res.json({ message: "OTP sent" });
});

// 2. Signup Verify
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

// 3. Login Init
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    const user = users.find(u => u.email === identifier || u.username === identifier);

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
    const token = jwt.sign({ email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, username: user.username } });
});

// 5. Forgot Password - Step 1 (Send OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        // Security: Don't reveal if email exists, just pretend it sent
        // But for this demo, we'll return an error to help you test
        return res.status(404).json({ message: "User not found with this email" });
    }

    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 300000, type: 'reset' });
    
    await sendEmail(email, otp, 'Hunt360 Password Reset Code');
    res.json({ message: "Reset code sent to email" });
});

// 6. Forgot Password - Step 2 (Reset Password)
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: "Password too weak. Use 8+ chars, numbers, & symbols." });
    }

    // Find and update user
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return res.status(404).json({ message: "User not found" });

    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    otpStore.delete(email);

    res.json({ message: "Password reset successfully. Please login." });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;