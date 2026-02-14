require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios'); // Required for Google Verification

const app = express();
app.use(express.json());
app.use(cors());

// YOUR GOOGLE SECRET KEY (From Google Admin Console)
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "YOUR_GOOGLE_SECRET_KEY_HERE";

// --- PERSISTENT USER ---
const users = [
    {
        id: 1,
        fullName: "Hunt360 Admin",
        username: "admin",
        email: "admin@hunt360.com",
        password: bcrypt.hashSync("Password@123", 10),
        department: "Admin",
        fullPhone: "+91 9876543210",
        failedLoginAttempts: 0,
        isLocked: false
    }
];

const otpStore = new Map(); 

// --- EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const sendEmail = async (email, otp, subject) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[DEBUG MOCK EMAIL] To: ${email} | Code: ${otp}`); return;
    }
    try { await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, html: `<h3>${subject}</h3><p>Code: <b>${otp}</b></p>` }); } 
    catch (error) { console.error("Email error:", error); }
};

// --- AUTH ROUTES ---

// 1. SIGNUP INIT
app.post('/api/auth/signup-init', async (req, res) => {
    const { fullName, email, password, department, countryCode, phoneNumber } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ message: "Email already registered" });
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password too weak." });
    const otp = generateOTP();
    otpStore.set(email, { otp, tempData: { fullName, username: fullName.split(' ')[0], email, password: await bcrypt.hash(password, 10), department, fullPhone: `${countryCode} ${phoneNumber}`, failedLoginAttempts: 0, isLocked: false }, expires: Date.now() + 300000 });
    await sendEmail(email, otp, 'Signup Code');
    res.json({ message: "OTP sent" });
});

// 2. SIGNUP VERIFY
app.post('/api/auth/signup-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    users.push({ id: users.length + 1, ...record.tempData });
    otpStore.delete(email);
    res.json({ token: "temp", user: { email } });
});

// 3. LOGIN (WITH RECAPTCHA)
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password, captchaToken } = req.body;

    // --- 1. VERIFY GOOGLE RECAPTCHA ---
    if (!captchaToken) return res.status(400).json({ message: "Please complete the CAPTCHA." });

    try {
        // If you haven't set up a key yet, skip this check for testing
        if (RECAPTCHA_SECRET_KEY !== "YOUR_GOOGLE_SECRET_KEY_HERE") {
            const googleRes = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
            );
            
            if (!googleRes.data.success) {
                return res.status(400).json({ message: "Robot detected! Login denied." });
            }
        }
    } catch (err) {
        console.error("Recaptcha Error:", err);
        return res.status(500).json({ message: "Captcha verification failed." });
    }

    // --- 2. PROCEED WITH LOGIN ---
    const user = users.find(u => u.email === identifier || u.username === identifier || u.fullName === identifier);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (user.isLocked) return res.status(403).json({ message: "Account Locked" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        user.failedLoginAttempts++;
        if (user.failedLoginAttempts >= 4) {
            user.isLocked = true;
            return res.status(403).json({ message: "Account Locked" });
        }
        return res.status(400).json({ message: `Invalid credentials. ${4 - user.failedLoginAttempts} attempts left.` });
    }

    user.failedLoginAttempts = 0;
    const otp = generateOTP();
    otpStore.set(user.email, { otp, expires: Date.now() + 300000 });
    await sendEmail(user.email, otp, 'Login OTP');
    res.json({ message: "OTP sent", email: user.email });
});

// ... (Keep Login Verify, Forgot/Reset Routes same as before) ...
app.post('/api/auth/login-verify', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    otpStore.delete(email);
    const user = users.find(u => u.email === email);
    const token = jwt.sign({ email, username: user.username }, "SECRET", { expiresIn: '7d' });
    res.json({ token, user });
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!users.find(u => u.email === email)) return res.status(404).json({ message: "User not found" });
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 300000, type: 'reset' });
    await sendEmail(email, otp, 'Reset Password');
    res.json({ message: "OTP sent" });
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);
    if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    const user = users.find(u => u.email === email);
    user.password = await bcrypt.hash(newPassword, 10);
    otpStore.delete(email);
    res.json({ message: "Reset success" });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;