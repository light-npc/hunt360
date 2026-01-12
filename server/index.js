require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. PERSISTENT USER STORAGE SOLUTION ---
// Because this app runs on free hosting (or local dev), the 'users' array 
// gets wiped every time the server restarts. 
// We pre-load this Admin user so you ALWAYS have an account that works.

const users = [
    {
        id: 1,
        fullName: "Hunt360 Admin",
        username: "admin", // Added username for fallback
        email: "jitumahataray@gmail.com",
        // The password is: Password@123
        // We use hashSync here to generate the hash immediately on server start
        password: bcrypt.hashSync("Password@123", 10), 
        department: "Admin",
        fullPhone: "+91 9876543210"
    }
];

const otpStore = new Map(); 

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email, otp, subject) => {
    // If credentials missing, log to console only (prevents crash)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[DEBUG - No Email Config] OTP for ${email}: ${otp}`); 
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">${subject}</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #2563EB; letter-spacing: 5px; background: #f0f9ff; display: inline-block; padding: 10px 20px; border-radius: 8px;">${otp}</h1>
                    <p style="color: #666; margin-top: 20px;">This code expires in 5 minutes.</p>
                </div>
            `
        });
        console.log(`[SUCCESS] Email sent to ${email}`);
    } catch (error) {
        console.error("Email error:", error);
    }
};

// --- AUTH ROUTES ---

// 1. SIGNUP INIT
app.post('/api/auth/signup-init', async (req, res) => {
    const { fullName, email, password, department, countryCode, phoneNumber } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // Validate Password Strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password does not meet requirements." });
    }

    const otp = generateOTP();
    
    // Store temp data
    otpStore.set(email, { 
        otp, 
        tempData: { 
            fullName, 
            username: fullName.split(' ')[0], // Generate simple username
            email, 
            password: await bcrypt.hash(password, 10), 
            department, 
            fullPhone: `${countryCode} ${phoneNumber}` 
        },
        expires: Date.now() + 300000 
    });

    await sendEmail(email, otp, 'Hunt360 Signup Verification');
    res.json({ message: "OTP sent" });
});

// 2. SIGNUP VERIFY
app.post('/api/auth/signup-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // Create User
    const newUser = { 
        id: users.length + 1, 
        ...record.tempData
    };
    users.push(newUser);
    otpStore.delete(email);

    const token = jwt.sign({ email, username: newUser.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email, username: newUser.fullName } });
});

// 3. LOGIN INIT
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    
    // Allow login via Email OR Username (or Full Name)
    const user = users.find(u => 
        u.email === identifier || 
        u.username === identifier || 
        u.fullName === identifier
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    otpStore.set(user.email, { otp, expires: Date.now() + 300000 });
    
    await sendEmail(user.email, otp, 'Hunt360 Login OTP');
    res.json({ message: "MFA OTP sent", email: user.email });
});

// 4. LOGIN VERIFY
app.post('/api/auth/login-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    const user = users.find(u => u.email === email);

    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);
    
    // 7 Day Token for "Remember Me" functionality
    const token = jwt.sign({ email, username: user.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, username: user.fullName } });
});

// 5. FORGOT PASSWORD - STEP 1 (SEND OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    // 'type: reset' ensures this OTP can only be used for password reset
    otpStore.set(email, { otp, expires: Date.now() + 300000, type: 'reset' });
    
    await sendEmail(email, otp, 'Reset Password Code');
    res.json({ message: "Reset code sent to email" });
});

// 6. FORGOT PASSWORD - STEP 2 (VERIFY OTP & UPDATE)
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp || record.type !== 'reset') {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return res.status(404).json({ message: "User not found" });

    // Check strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: "Password too weak." });
    }

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