import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { Eye, EyeOff, AlertCircle, ArrowLeft, Check } from 'lucide-react';

const Auth = () => {
  const [view, setView] = useState('login'); // Default is login
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Updated Form Data Structure
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    identifier: '', 
    password: '', 
    otp: '',
    newPassword: '',
    department: '',
    countryCode: '+91',
    phoneNumber: ''
  });

  // Password Validation State
  const [pwdCriteria, setPwdCriteria] = useState({
      length: false,
      upper: false,
      lower: false,
      number: false,
      special: false
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(''); 
  
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access navigation state

  // Country Codes List
  const countryCodes = [
      { code: '+91', flag: '🇮🇳' },
      { code: '+1', flag: '🇺🇸' },
      { code: '+44', flag: '🇬🇧' },
      { code: '+971', flag: '🇦🇪' },
      { code: '+65', flag: '🇸🇬' },
      { code: '+61', flag: '🇦🇺' },
  ];

  // --- NEW LOGIC: Handle Direct Signup Redirect ---
  useEffect(() => {
    // If the previous page sent { view: 'signup' }, switch to signup immediately
    if (location.state?.view) {
        setView(location.state.view);
        // Clear history state so browser refresh doesn't get stuck
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load Saved User ID
  useEffect(() => {
    const savedId = localStorage.getItem('hunt360_identifier');
    if (savedId) {
        setFormData(prev => ({ ...prev, identifier: savedId }));
        setRememberMe(true);
    }
  }, []);

  // Real-time Password Validation
  useEffect(() => {
      const pwd = view === 'forgot' ? formData.newPassword : formData.password;
      setPwdCriteria({
          length: pwd.length >= 8,
          upper: /[A-Z]/.test(pwd),
          lower: /[a-z]/.test(pwd),
          number: /[0-9]/.test(pwd),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
      });
  }, [formData.password, formData.newPassword, view]);

  const validatePasswordFinal = () => {
      const { length, upper, lower, number, special } = pwdCriteria;
      return length && upper && lower && number && special;
  };

  const resetState = (newView) => {
      setView(newView);
      setStep(1);
      setError('');
      setFormData(prev => ({ 
          ...prev, 
          password: '', otp: '', newPassword: '', fullName: '', department: '', phoneNumber: '' 
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        if (step === 1) {
            const res = await axios.post('/api/auth/login', { 
                identifier: formData.identifier, 
                password: formData.password 
            });
            setVerificationEmail(res.data.email); 
            setStep(2);
        } else {
            const res = await axios.post('/api/auth/login-verify', {
                email: verificationEmail,
                otp: formData.otp
            });
            handleLoginSuccess(res.data);
        }
      } else if (view === 'signup') {
        if (step === 1) {
            if (!validatePasswordFinal()) {
                throw new Error("Please meet all password requirements.");
            }
            if (!formData.department) throw new Error("Please select a department.");
            
            await axios.post('/api/auth/signup-init', { 
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                department: formData.department,
                countryCode: formData.countryCode,
                phoneNumber: formData.phoneNumber
            });
            setVerificationEmail(formData.email);
            setStep(2);
        } else {
            const res = await axios.post('/api/auth/signup-verify', {
                email: verificationEmail,
                otp: formData.otp
            });
            handleLoginSuccess(res.data);
        }
      } else if (view === 'forgot') {
          if (step === 1) {
              await axios.post('/api/auth/forgot-password', { email: formData.email });
              setVerificationEmail(formData.email);
              setStep(2);
          } else {
              if (!validatePasswordFinal()) {
                  throw new Error("New password does not meet requirements.");
              }
              await axios.post('/api/auth/reset-password', {
                  email: verificationEmail,
                  otp: formData.otp,
                  newPassword: formData.newPassword
              });
              alert("Password reset successfully! Please login.");
              resetState('login');
          }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
        setLoading(false);
    }
  };

  const handleLoginSuccess = (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (rememberMe && view === 'login') {
          localStorage.setItem('hunt360_identifier', formData.identifier);
      } else if (!rememberMe && view === 'login') {
          localStorage.removeItem('hunt360_identifier');
      }
      navigate('/dashboard');
  };

  // Helper Component for Password Checklist Item
  const RequirementItem = ({ met, text }) => (
      <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-300' : 'text-gray-400'}`}>
          {met ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-600"></div>}
          <span>{text}</span>
      </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center font-sans">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div 
            className="absolute inset-0 animate-bg-motion"
            style={{
                backgroundImage: 'url("/assets/tech-map.jpg")', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        ></div>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content Layer */}
      <div className={`relative z-10 w-full px-4 transition-all duration-300 ${view === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl relative">
            
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

            <h2 className="text-3xl font-bold mb-6 text-center text-white tracking-tight">
                {view === 'login' && 'Welcome Back'}
                {view === 'signup' && 'Create New Account'}
                {view === 'forgot' && 'Reset Password'}
            </h2>

            {/* YELLOW NOTE BOX (Signup Only) */}
            {view === 'signup' && step === 1 && (
                <div className="bg-yellow-100/90 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-6 rounded text-sm shadow-md">
                    <p><strong>Note:</strong> After registering, your account will be sent to the Administrator for approval.</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 mb-6 rounded-lg flex items-start gap-2 backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-100">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {step === 1 && (
                    <>
                        {/* --- SIGNUP VIEW --- */}
                        {view === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">FULL NAME *</label>
                                    <input type="text" placeholder="Enter your full name" 
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">EMAIL ADDRESS *</label>
                                    <input type="email" placeholder="Enter your email address" 
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">PASSWORD *</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} placeholder="Enter a strong password" 
                                            className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none pr-10 transition"
                                            value={formData.password}
                                            onChange={e => setFormData({...formData, password: e.target.value})} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Requirements Checklist */}
                                    <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-1">
                                        <p className="text-xs text-gray-400 font-semibold mb-1">Password Requirements:</p>
                                        <RequirementItem met={pwdCriteria.length} text="At least 8 characters" />
                                        <RequirementItem met={pwdCriteria.upper} text="One uppercase letter (A-Z)" />
                                        <RequirementItem met={pwdCriteria.lower} text="One lowercase letter (a-z)" />
                                        <RequirementItem met={pwdCriteria.number} text="One number (0-9)" />
                                        <RequirementItem met={pwdCriteria.special} text="One special character (!@#$%^&*)" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">DEPARTMENT *</label>
                                    <select 
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.department}
                                        onChange={e => setFormData({...formData, department: e.target.value})}
                                        required
                                    >
                                        <option value="" className="text-gray-500">Select Department</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Business Department">Business Department</option>
                                        <option value="Employee">Employee</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">PHONE NUMBER *</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-28">
                                            <select 
                                                className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                value={formData.countryCode}
                                                onChange={e => setFormData({...formData, countryCode: e.target.value})}
                                            >
                                                {countryCodes.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.flag} {c.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <input type="tel" placeholder="Mobile Number" 
                                            className="flex-1 p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Enter your 10-digit mobile number. Country code ({formData.countryCode}) is automatically added.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* --- LOGIN VIEW --- */}
                        {view === 'login' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">EMAIL OR FULL NAME</label>
                                    <input type="text" placeholder="Enter email or full name" 
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.identifier}
                                        onChange={e => setFormData({...formData, identifier: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">PASSWORD</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" 
                                            className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none pr-10 transition"
                                            value={formData.password}
                                            onChange={e => setFormData({...formData, password: e.target.value})} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="accent-blue-500 h-4 w-4 rounded border-gray-600 bg-gray-900" />
                                        <span className="text-sm text-gray-400 group-hover:text-gray-200 transition">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => resetState('forgot')} className="text-sm text-blue-400 hover:text-blue-300 transition">
                                        Forgot password?
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- FORGOT PASSWORD FIELDS --- */}
                        {view === 'forgot' && (
                            <div>
                                <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">EMAIL ADDRESS</label>
                                <input type="email" placeholder="name@company.com" 
                                    className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                        )}
                    </>
                )}

                {/* --- STEP 2: OTP (Shared) --- */}
                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <p className="text-center text-sm text-gray-300 bg-blue-900/30 p-3 rounded border border-blue-500/30">
                            Verification code sent to <br/><strong className="text-white">{verificationEmail}</strong>
                        </p>
                        
                        <div>
                            <input type="text" placeholder="000000" maxLength="6"
                                className="w-full p-4 bg-gray-900/80 border-2 border-blue-500/50 rounded-lg text-center text-3xl font-bold tracking-[0.5em] text-white outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition"
                                value={formData.otp}
                                onChange={e => setFormData({...formData, otp: e.target.value})} required />
                        </div>

                        {view === 'forgot' && (
                            <div>
                                <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">NEW PASSWORD</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="New strong password" 
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                        value={formData.newPassword}
                                        onChange={e => setFormData({...formData, newPassword: e.target.value})} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {/* Re-use Checklist for Reset */}
                                <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-1">
                                    <RequirementItem met={pwdCriteria.length} text="At least 8 characters" />
                                    <RequirementItem met={pwdCriteria.upper} text="One uppercase letter (A-Z)" />
                                    <RequirementItem met={pwdCriteria.lower} text="One lowercase letter (a-z)" />
                                    <RequirementItem met={pwdCriteria.number} text="One number (0-9)" />
                                    <RequirementItem met={pwdCriteria.special} text="One special character (!@#$%^&*)" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-lg font-bold text-lg hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/50 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {loading ? 'Processing...' : (
                        step === 1 ? (view === 'forgot' ? 'Send Reset Code' : (view === 'login' ? 'Login' : 'Register')) 
                        : (view === 'forgot' ? 'Reset Password' : 'Verify & Enter')
                    )}
                </button>
                
                {view === 'forgot' && step === 1 && (
                    <button type="button" onClick={() => resetState('login')} 
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-white mt-2 transition">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                )}
            </form>

            {view !== 'forgot' && (
                <p className="mt-8 text-center text-sm text-gray-400">
                    {view === 'login' ? "New to Hunt360?" : "Already have an account?"}{" "}
                    <button className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition"
                        onClick={() => resetState(view === 'login' ? 'signup' : 'login')}>
                        {view === 'login' ? 'Create Account' : 'Login'}
                    </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;