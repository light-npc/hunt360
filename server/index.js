require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

const users = []; 
const otpStore = new Map(); 

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Improved Email Function
const sendEmail = async (email, otp, subject) => {
    console.log(`[DEBUG] OTP for ${email}: ${otp}`); // Always logs to console
    
    // If credentials are missing, don't crash, just return
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing in .env. OTP not sent via email.");
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: `<h2>Hunt360 Code: <span style="color:blue">${otp}</span></h2>`
        });
        console.log("✅ Email sent successfully.");
    } catch (error) {
        console.error("❌ FAILED TO SEND EMAIL:", error.message);
        // We do NOT throw the error here, so the signup continues even if email fails
    }
};

// --- ROUTES ---

// 1. Signup Init
app.post('/api/auth/signup-init', async (req, res) => {
    try {
        console.log("Received Signup Data:", req.body); // Debugging line

        const { fullName, email, password, department, countryCode, phoneNumber } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        
        const existingUser = users.find(u => u.email === email);
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const otp = generateOTP();
        
        // Save to temp store
        otpStore.set(email, { 
            otp, 
            tempData: { 
                fullName, 
                email, 
                password: await bcrypt.hash(password, 10),
                department,
                fullPhone: `${countryCode} ${phoneNumber}`
            },
            expires: Date.now() + 300000 
        });

        // Send Email (will log error to console if fails, but won't crash server)
        await sendEmail(email, otp, 'Welcome to Hunt360 - Signup OTP');
        
        res.json({ message: "OTP generated. Check console if email not received." });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ message: "Internal Server Error. Check terminal logs." });
    }
});

// 2. Signup Verify
app.post('/api/auth/signup-verify', (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore.get(email);

        if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        // Safe Username Generation
        const safeName = record.tempData.fullName ? record.tempData.fullName.split(' ')[0] : 'user';
        
        const newUser = { 
            id: users.length + 1, 
            ...record.tempData,
            username: safeName.toLowerCase() + Math.floor(Math.random()*1000)
        };
        
        users.push(newUser);
        otpStore.delete(email);

        const token = jwt.sign({ email, fullName: newUser.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: newUser });
    } catch (error) {
        console.error("VERIFY ERROR:", error);
        res.status(500).json({ message: "Verification failed." });
    }
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = users.find(u => u.email === identifier || u.username === identifier);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const otp = generateOTP();
        otpStore.set(user.email, { otp, expires: Date.now() + 300000 });
        
        await sendEmail(user.email, otp, 'Hunt360 Login OTP');
        res.json({ message: "MFA OTP sent", email: user.email });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Login failed." });
    }
});

// 4. Login Verify
app.post('/api/auth/login-verify', (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore.get(email);
        const user = users.find(u => u.email === email);

        if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        otpStore.delete(email);
        const token = jwt.sign({ email, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Verify failed" });
    }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;