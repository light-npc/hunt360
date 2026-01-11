require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Built-in Node module for secure tokens

const app = express();
app.use(express.json());
app.use(cors());

const users = []; 
// Store tokens: Map<Token, { email, expires }>
const tokenStore = new Map(); 
const otpStore = new Map(); // Keep this for Signup/Login OTPs

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Email Sender
const sendEmail = async (email, subject, htmlContent) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[DEBUG - No Email Creds] To: ${email} | Subject: ${subject}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent
        });
        console.log(`[SUCCESS] Email sent to ${email}`);
    } catch (error) {
        console.error("[EMAIL ERROR]", error);
    }
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup-init', async (req, res) => {
    // UPDATED: Destructure new fields
    const { fullName, email, password, department, countryCode, phoneNumber } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // Validate Password strictly on backend too
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password does not meet requirements." });
    }

    const otp = generateOTP();
    // UPDATED: Store all new fields in tempData
    otpStore.set(email, { 
        otp, 
        tempData: { 
            fullName, 
            email, 
            password: await bcrypt.hash(password, 10),
            department,
            fullPhone: `${countryCode} ${phoneNumber}`,
            status: 'Pending Approval' // Simulating the Admin Note logic
        },
        expires: Date.now() + 300000 
    });

    await sendEmail(email, otp, 'Hunt360 Signup Verification');
    res.json({ message: "OTP sent" });
});

app.post('/api/auth/signup-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // UPDATED: Create user with new fields
    const newUser = { 
        id: users.length + 1, 
        ...record.tempData
    };
    users.push(newUser);
    otpStore.delete(email);

    const token = jwt.sign({ email, username: newUser.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email, username: newUser.fullName, department: newUser.department } });
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    // Login with Email OR Full Name (previously username)
    const user = users.find(u => u.email === identifier || u.fullName === identifier);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    otpStore.set(user.email, { otp, expires: Date.now() + 300000 });
    
    await sendEmail(user.email, otp, 'Hunt360 Login OTP');
    res.json({ message: "MFA OTP sent", email: user.email });
});

app.post('/api/auth/login-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    const user = users.find(u => u.email === email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);
    const token = jwt.sign({ email, username: user.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, username: user.fullName } });
});

// --- NEW PASSWORD RESET LOGIC ---

// 1. Forgot Password - Generates Link
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        // Security: Don't reveal user existence, but return success
        return res.json({ message: "If account exists, reset link sent." });
    }

    // Generate a secure random token (32 bytes hex)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save token with 15 min expiration
    tokenStore.set(token, { 
        email, 
        expires: Date.now() + 900000 // 15 mins
    });

    // Create Link
    // NOTE: CLIENT_URL should be your Vercel URL (e.g., https://hunt360.vercel.app)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    const emailHtml = `
        <div style="font-family: Arial; padding: 20px; color: #333;">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset for Hunt360. Click the link below to set a new password:</p>
            <a href="${resetLink}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
            <p style="font-size: 12px; color: #666;">This link expires in 15 minutes.</p>
        </div>
    `;

    await sendEmail(email, 'Hunt360 Password Reset', emailHtml);
    res.json({ message: "Reset link sent to your email." });
});

// 2. Reset Password - Uses Token
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    const record = tokenStore.get(token);

    if (!record) {
        return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    if (Date.now() > record.expires) {
        tokenStore.delete(token);
        return res.status(400).json({ message: "Link has expired. Please request a new one." });
    }

    // Validate Password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: "Password does not meet requirements." });
    }

    // Update User Password
    const userIndex = users.findIndex(u => u.email === record.email);
    if (userIndex !== -1) {
        users[userIndex].password = await bcrypt.hash(newPassword, 10);
    }

    tokenStore.delete(token); // Consume token so it can't be used again
    res.json({ message: "Password reset successfully. Please login." });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;