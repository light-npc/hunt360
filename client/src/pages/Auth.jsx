import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { Eye, EyeOff, AlertCircle, ArrowLeft, Check, Mail } from 'lucide-react';

const Auth = () => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot', 'reset-final'
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({ 
    fullName: '', email: '', identifier: '', password: '', 
    otp: '', newPassword: '', department: '', countryCode: '+91', phoneNumber: ''
  });

  const [pwdCriteria, setPwdCriteria] = useState({
      length: false, upper: false, lower: false, number: false, special: false
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(''); 
  
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get URL params

  // 1. Check for Reset Token in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token');

    if (urlToken) {
        setView('reset-final'); // Switch to new reset view
        // Store token in formData temporarily (or a separate state)
        setFormData(prev => ({ ...prev, otp: urlToken })); 
    }
  }, [location]);

  // 2. Load Remember Me
  useEffect(() => {
    const savedId = localStorage.getItem('hunt360_identifier');
    if (savedId) {
        setFormData(prev => ({ ...prev, identifier: savedId }));
        setRememberMe(true);
    }
  }, []);

  // 3. Password Validation Logic
  useEffect(() => {
      const pwd = (view === 'reset-final') ? formData.newPassword : formData.password;
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
      setSuccessMsg('');
      setFormData(prev => ({ ...prev, password: '', otp: '', newPassword: '' }));
      if (newView === 'login') navigate('/auth'); // Clear URL params if going back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // --- LOGIN ---
      if (view === 'login') {
        if (step === 1) {
            const res = await axios.post('/api/auth/login', { 
                identifier: formData.identifier, password: formData.password 
            });
            setVerificationEmail(res.data.email); setStep(2);
        } else {
            const res = await axios.post('/api/auth/login-verify', {
                email: verificationEmail, otp: formData.otp
            });
            handleLoginSuccess(res.data);
        }
      } 
      // --- SIGNUP ---
      else if (view === 'signup') {
        if (step === 1) {
            if (!validatePasswordFinal()) throw new Error("Please meet all password requirements.");
            await axios.post('/api/auth/signup-init', { ...formData });
            setVerificationEmail(formData.email); setStep(2);
        } else {
            const res = await axios.post('/api/auth/signup-verify', {
                email: verificationEmail, otp: formData.otp
            });
            handleLoginSuccess(res.data);
        }
      } 
      // --- FORGOT PASSWORD (STEP 1: SEND LINK) ---
      else if (view === 'forgot') {
          await axios.post('/api/auth/forgot-password', { email: formData.email });
          setSuccessMsg(`Reset link sent to ${formData.email}. Check your inbox.`);
          setLoading(false);
          // We stay on this view to show the success message
      }
      // --- RESET PASSWORD (STEP 2: VIA LINK) ---
      else if (view === 'reset-final') {
          if (!validatePasswordFinal()) throw new Error("New password is too weak.");
          
          await axios.post('/api/auth/reset-password', {
              token: formData.otp, // We stored URL token in 'otp' field
              newPassword: formData.newPassword
          });
          
          alert("Password reset successfully! Please login.");
          navigate('/auth'); // Remove token from URL
          resetState('login');
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
      
      {/* Background (Same as before) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animate-bg-motion" style={{ backgroundImage: 'url("/assets/tech-map.jpg")', backgroundSize: 'cover' }}></div>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

            <h2 className="text-3xl font-bold mb-6 text-center text-white">
                {view === 'login' && 'Welcome Back'}
                {view === 'signup' && 'Create Account'}
                {view === 'forgot' && 'Reset Password'}
                {view === 'reset-final' && 'Set New Password'}
            </h2>
            
            {error && <div className="bg-red-500/20 border border-red-500/50 p-3 mb-6 rounded text-sm text-red-100 flex gap-2"><AlertCircle size={16}/>{error}</div>}
            
            {/* Success Message for Link Sent */}
            {successMsg && (
                <div className="bg-green-500/20 border border-green-500/50 p-4 mb-6 rounded text-center">
                    <Mail className="mx-auto text-green-400 mb-2" />
                    <p className="text-sm text-green-100">{successMsg}</p>
                    <button onClick={() => resetState('login')} className="mt-3 text-xs text-blue-300 hover:underline">Back to Login</button>
                </div>
            )}

            {!successMsg && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* --- FORGOT PASSWORD VIEW (Enter Email) --- */}
                {view === 'forgot' && (
                    <div>
                        <label className="block text-xs font-bold text-blue-300 mb-2">EMAIL ADDRESS</label>
                        <input type="email" placeholder="name@company.com" 
                            className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded text-white"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                )}

                {/* --- RESET FINAL VIEW (Enter New Password) --- */}
                {view === 'reset-final' && (
                    <div>
                        <label className="block text-xs font-bold text-blue-300 mb-2">NEW PASSWORD</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="New strong password" 
                                className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded text-white pr-10"
                                value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-1">
                            <RequirementItem met={pwdCriteria.length} text="8+ chars" />
                            <RequirementItem met={pwdCriteria.special} text="Symbol" />
                            <RequirementItem met={pwdCriteria.upper} text="Upper" />
                            <RequirementItem met={pwdCriteria.number} text="Number" />
                        </div>
                    </div>
                )}

                {/* --- LOGIN & SIGNUP FIELDS (Standard) --- */}
                {/* (Keeping existing logic for Login/Signup Step 1 & 2) */}
                {(view === 'login' || view === 'signup') && step === 1 && (
                    <>
                        {view === 'signup' && <input type="text" placeholder="Full Name" className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded text-white" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} required />}
                        
                        {(view === 'login') 
                            ? <input type="text" placeholder="Email or Username" className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded text-white" value={formData.identifier} onChange={e=>setFormData({...formData, identifier: e.target.value})} required />
                            : <input type="email" placeholder="Email Address" className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded text-white" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required />
                        }

                        <input type="password" placeholder="Password" className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded text-white" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required />
                        
                        {view === 'login' && <div className="flex justify-between mt-1"><label className="flex gap-2 text-gray-400 text-sm cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}/>Remember me</label><button type="button" onClick={()=>resetState('forgot')} className="text-sm text-blue-400 hover:underline">Forgot password?</button></div>}
                    </>
                )}
                
                {/* OTP Input for Login/Signup */}
                {(view === 'login' || view === 'signup') && step === 2 && (
                    <input type="text" placeholder="000000" maxLength="6" className="w-full p-4 bg-gray-900/80 border-2 border-blue-500/50 rounded text-center text-3xl font-bold text-white tracking-[0.5em]" value={formData.otp} onChange={e=>setFormData({...formData, otp: e.target.value})} required />
                )}

                {/* Submit Button */}
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded font-bold hover:shadow-lg transition disabled:opacity-50">
                    {loading ? 'Processing...' : (
                        view === 'forgot' ? 'Send Reset Link' : 
                        view === 'reset-final' ? 'Reset Password' :
                        step === 1 ? (view === 'login' ? 'Login' : 'Register') : 'Verify & Enter'
                    )}
                </button>

                {/* Back Buttons */}
                {(view === 'forgot' || view === 'signup') && step === 1 && (
                    <button type="button" onClick={() => resetState('login')} className="flex items-center justify-center gap-2 text-gray-400 hover:text-white mt-2">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                )}
            </form>
            )}

            {/* Footer Links */}
            {(view === 'login' || view === 'signup') && !successMsg && (
                <p className="mt-8 text-center text-sm text-gray-400">
                    {view === 'login' ? "New here?" : "Have an account?"} <button className="text-blue-400 font-bold hover:underline" onClick={() => resetState(view === 'login' ? 'signup' : 'login')}>{view === 'login' ? 'Create Account' : 'Login'}</button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;