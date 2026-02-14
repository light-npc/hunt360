import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha"; 

const Auth = () => {
  const [view, setView] = useState('login'); 
  const [step, setStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const recaptchaRef = useRef(null); 

  const [formData, setFormData] = useState({ 
    fullName: '', email: '', identifier: '', password: '', 
    otp: '', newPassword: '', department: '', countryCode: '+91', phoneNumber: '',
    captchaToken: '' 
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password Strength State
  const [pwdCriteria, setPwdCriteria] = useState({ 
      length: false, upper: false, lower: false, number: false, special: false 
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const SITE_KEY = "6LdVNFAsAAAAAHorOVoRwEuzh8e9yFLwYzvJmYX9"; // Replace with your key

  const countryCodes = [
      { code: '+91', flag: '🇮🇳' }
  ];

  // Handle incoming redirects
  useEffect(() => {
    if (location.state?.view) {
        setView(location.state.view);
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load saved user
  useEffect(() => {
    const savedId = localStorage.getItem('hunt360_identifier');
    if (savedId) { setFormData(prev => ({ ...prev, identifier: savedId })); setRememberMe(true); }
  }, []);

  // --- PASSWORD VALIDATION LOGIC ---
  // Updated to check 'newPassword' if we are in the Forgot Password flow
  useEffect(() => {
      // Determine which password field to validate
      const pwd = (view === 'forgot' && step === 2) ? formData.newPassword : formData.password;
      
      setPwdCriteria({
          length: pwd.length >= 8,
          upper: /[A-Z]/.test(pwd),
          lower: /[a-z]/.test(pwd),
          number: /[0-9]/.test(pwd),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
      });
  }, [formData.password, formData.newPassword, view, step]);

  const validatePasswordFinal = () => Object.values(pwdCriteria).every(Boolean);

  const resetState = (newView) => {
      setView(newView);
      setStep(1);
      setError('');
      setFormData(prev => ({ ...prev, password: '', otp: '', newPassword: '', captchaToken: '' }));
  };

  const onCaptchaChange = (token) => {
      setFormData(prev => ({ ...prev, captchaToken: token }));
      setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        if (step === 1) {
            // Login Step 1
            if (!formData.captchaToken) throw new Error("Please verify that you are not a robot.");
            const res = await axios.post('/api/auth/login', { 
                identifier: formData.identifier, password: formData.password, captchaToken: formData.captchaToken 
            });
            setVerificationEmail(res.data.email); setStep(2);
        } else {
            // Login Step 2
            const res = await axios.post('/api/auth/login-verify', { email: verificationEmail, otp: formData.otp });
            handleLoginSuccess(res.data);
        }
      } 
      else if (view === 'signup') {
        if (step === 1) {
            if (!validatePasswordFinal()) throw new Error("Please meet all password requirements.");
            await axios.post('/api/auth/signup-init', { ...formData });
            setVerificationEmail(formData.email); setStep(2);
        } else {
            const res = await axios.post('/api/auth/signup-verify', { email: verificationEmail, otp: formData.otp });
            handleLoginSuccess(res.data);
        }
      } 
      else if (view === 'forgot') {
          if (step === 1) {
              // --- FORGOT PASSWORD STEP 1: Send Email ---
              if(!formData.email) throw new Error("Please enter your email.");
              await axios.post('/api/auth/forgot-password', { email: formData.email });
              setVerificationEmail(formData.email); 
              setStep(2);
          } else {
              // --- FORGOT PASSWORD STEP 2: Verify & Reset ---
              if (!validatePasswordFinal()) throw new Error("New password does not meet requirements.");
              await axios.post('/api/auth/reset-password', { 
                  email: verificationEmail, 
                  otp: formData.otp, 
                  newPassword: formData.newPassword 
              });
              alert("Password Reset Successfully! Please login."); 
              resetState('login');
          }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
      if (view === 'login' && step === 1 && recaptchaRef.current) {
          recaptchaRef.current.reset();
          setFormData(prev => ({ ...prev, captchaToken: '' }));
      }
    } finally { setLoading(false); }
  };

  const handleLoginSuccess = (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (rememberMe && view === 'login') localStorage.setItem('hunt360_identifier', formData.identifier);
      else if (!rememberMe && view === 'login') localStorage.removeItem('hunt360_identifier');
      navigate('/dashboard');
  };

  const RequirementItem = ({ met, text }) => (
      <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-300' : 'text-gray-400'}`}>
          {met ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-600"></div>}
          <span>{text}</span>
      </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animate-bg-motion" style={{ backgroundImage: 'url("/assets/tech-map.jpg")', backgroundSize: 'cover' }}></div>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className={`relative z-10 w-full px-4 transition-all duration-300 ${view === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

            <h2 className="text-3xl font-bold mb-6 text-center text-white tracking-tight">
                {view === 'login' && 'Welcome Back'}
                {view === 'signup' && 'Create New Account'}
                {view === 'forgot' && 'Reset Password'}
            </h2>

            {view === 'signup' && step === 1 && (
                <div className="bg-yellow-100/90 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-6 rounded text-sm shadow-md">
                    <p><strong>Note:</strong> After registering, your account will be sent to the Administrator for approval.</p>
                </div>
            )}
            
            {error && <div className="bg-red-500/20 border border-red-500/50 p-3 mb-6 rounded-lg flex items-start gap-2 backdrop-blur-sm"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-100">{error}</p></div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* --- STEP 1 --- */}
                {step === 1 && (
                    <>
                        {/* 1. SIGNUP FIELDS */}
                        {view === 'signup' && (
                            <>
                                <div><label className="label-style">FULL NAME *</label><input type="text" placeholder="Full name" className="input-field-style" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required /></div>
                                <div><label className="label-style">EMAIL ADDRESS *</label><input type="email" placeholder="Email address" className="input-field-style" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                            </>
                        )}

                        {/* 2. FORGOT PASSWORD FIELD (Add this!) */}
                        {view === 'forgot' && (
                            <div>
                                <label className="label-style">EMAIL ADDRESS *</label>
                                <input 
                                    type="email" 
                                    placeholder="Enter your registered email" 
                                    className="input-field-style" 
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                    required 
                                />
                            </div>
                        )}

                        {/* 3. LOGIN/SIGNUP PASSWORD */}
                        {(view === 'login' || view === 'signup') && (
                            <>
                                {view === 'login' && <div><label className="label-style">EMAIL OR USERNAME</label><input type="text" placeholder="username or email" className="input-field-style" value={formData.identifier} onChange={e => setFormData({...formData, identifier: e.target.value})} required /></div>}
                                
                                <div>
                                    <label className="label-style">PASSWORD</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="input-field-style pr-10" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                    {/* Signup Criteria */}
                                    {view === 'signup' && (
                                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-1">
                                            <RequirementItem met={pwdCriteria.length} text="At least 8 characters" />
                                            <RequirementItem met={pwdCriteria.upper} text="One uppercase letter (A-Z)" />
                                            <RequirementItem met={pwdCriteria.lower} text="One lowercase letter (a-z)" />
                                            <RequirementItem met={pwdCriteria.number} text="One number (0-9)" />
                                            <RequirementItem met={pwdCriteria.special} text="One special character" />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {view === 'login' && (
                            <div className="flex justify-center my-1"><ReCAPTCHA ref={recaptchaRef} sitekey={SITE_KEY} theme="dark" onChange={onCaptchaChange} /></div>
                        )}

                        {/* Signup Extra Fields */}
                        {view === 'signup' && (
                            <>
                                <div className="mt-4"><label className="label-style">DEPARTMENT</label><select className="input-field-style" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required><option value="">Select</option><option value="Admin">Admin</option><option value="Business Development">Business Development</option><option value="Recruiter">Recruiter</option></select></div>
                                <div className="mt-4"><label className="label-style">PHONE</label><div className="flex gap-2"><div className="relative w-28"><select className="input-field-style" value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value})}>{countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}</select></div><input type="tel" placeholder="Mobile" className="flex-1 input-field-style" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required /></div></div>
                            </>
                        )}

                        {view === 'login' && (
                            <div className="flex justify-between items-center text-sm mt-2">
                                <label className="flex items-center gap-2 text-gray-400 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}/> Remember me</label>
                                <button type="button" onClick={() => resetState('forgot')} className="text-blue-400 hover:underline">Forgot Password?</button>
                            </div>
                        )}
                    </>
                )}

                {/* --- STEP 2: VERIFICATION --- */}
                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <p className="text-center text-sm text-gray-300 bg-blue-900/30 p-3 rounded border border-blue-500/30">
                            Verification code sent to <br/><strong className="text-white">{verificationEmail}</strong>
                        </p>
                        
                        <input type="text" placeholder="000000" maxLength="6" className="w-full p-4 bg-gray-900/80 border-2 border-blue-500/50 rounded-lg text-center text-3xl font-bold tracking-[0.5em] text-white outline-none focus:border-blue-400" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} required />
                        
                        {/* --- FORGOT PASSWORD NEW FIELDS (With Criteria) --- */}
                        {view === 'forgot' && (
                            <div>
                                <label className="label-style">NEW PASSWORD</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="New strong password" className="input-field-style pr-10" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                {/* Password Criteria Checklist for Reset */}
                                <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-1">
                                    <RequirementItem met={pwdCriteria.length} text="At least 8 characters" />
                                    <RequirementItem met={pwdCriteria.upper} text="One uppercase letter (A-Z)" />
                                    <RequirementItem met={pwdCriteria.lower} text="One lowercase letter (a-z)" />
                                    <RequirementItem met={pwdCriteria.number} text="One number (0-9)" />
                                    <RequirementItem met={pwdCriteria.special} text="One special character" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-lg font-bold text-lg hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/50 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {loading ? 'Processing...' : (step === 1 ? (view === 'forgot' ? 'Send Reset Code' : (view === 'login' ? 'Login' : 'Register')) : (view === 'forgot' ? 'Reset Password' : 'Verify & Enter'))}
                </button>

                {view === 'forgot' && step === 1 && (<button type="button" onClick={() => resetState('login')} className="flex items-center justify-center gap-2 text-gray-400 hover:text-white mt-2"><ArrowLeft size={16} /> Back to Login</button>)}
            </form>

            {view !== 'forgot' && (
                <p className="mt-8 text-center text-sm text-gray-400">{view === 'login' ? "New to Hunt360?" : "Already have an account?"} <button className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition" onClick={() => resetState(view === 'login' ? 'signup' : 'login')}>{view === 'login' ? 'Create Account' : 'Login'}</button></p>
            )}
        </div>
      </div>
      <style>{`.label-style { display: block; font-size: 0.75rem; font-weight: 700; color: #93c5fd; margin-bottom: 0.5rem; letter-spacing: 0.05em; } .input-field-style { width: 100%; padding: 0.75rem; background-color: rgba(17, 24, 39, 0.5); border: 1px solid #4b5563; border-radius: 0.5rem; color: white; outline: none; transition: all 0.2s; } .input-field-style:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }`}</style>
    </div>
  );
};

export default Auth;