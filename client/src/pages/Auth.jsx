import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    identifier: '', 
    password: '', 
    otp: '',
    newPassword: ''
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    const savedId = localStorage.getItem('hunt360_identifier');
    if (savedId) {
        setFormData(prev => ({ ...prev, identifier: savedId }));
        setRememberMe(true);
    }
  }, []);

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const resetState = (newView) => {
      setView(newView);
      setStep(1);
      setError('');
      // UX: If coming from Forgot Password, auto-fill login identifier with the email used
      if (newView === 'login' && view === 'forgot' && formData.email) {
          setFormData(prev => ({ ...prev, identifier: prev.email, password: '', otp: '', newPassword: '' }));
      } else {
          setFormData(prev => ({ ...prev, password: '', otp: '', newPassword: '' }));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // --- LOGIN FLOW ---
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
      } 
      // --- SIGNUP FLOW ---
      else if (view === 'signup') {
        if (step === 1) {
            if (!validatePassword(formData.password)) {
                throw new Error("Password must contain: Uppercase, Lowercase, Number, Special Char & 8+ chars.");
            }
            await axios.post('/api/auth/signup-init', { 
                username: formData.username,
                email: formData.email,
                password: formData.password,
                captchaToken: "valid_token" 
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
      }
      // --- FORGOT PASSWORD FLOW ---
      else if (view === 'forgot') {
          if (step === 1) {
              await axios.post('/api/auth/forgot-password', { email: formData.email });
              setVerificationEmail(formData.email);
              setStep(2);
          } else {
              if (!validatePassword(formData.newPassword)) {
                  throw new Error("New password is too weak.");
              }
              await axios.post('/api/auth/reset-password', {
                  email: verificationEmail,
                  otp: formData.otp,
                  newPassword: formData.newPassword
              });
              alert("Password reset successfully! Please login with your new password.");
              resetState('login'); // Switch back to login view
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-blue-500"></div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'forgot' && 'Reset Password'}
        </h2>
        
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {step === 1 && (
                <>
                    {view === 'signup' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">USERNAME</label>
                            <input type="text" placeholder="johndoe" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})} required />
                        </div>
                    )}

                    {(view === 'signup' || view === 'forgot') && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">EMAIL ADDRESS</label>
                            <input type="email" placeholder="name@company.com" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    )}

                    {view === 'login' && (
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">EMAIL OR USERNAME</label>
                            <input type="text" placeholder="username or email" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                value={formData.identifier}
                                onChange={e => setFormData({...formData, identifier: e.target.value})} required />
                        </div>
                    )}

                    {(view === 'login' || view === 'signup') && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">PASSWORD</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" 
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none pr-10"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="flex items-center justify-between mt-1">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="accent-purple-600 h-4 w-4" />
                                <span className="text-sm text-gray-600">Remember me</span>
                             </label>
                             <button type="button" onClick={() => resetState('forgot')} className="text-sm text-purple-600 hover:underline">
                                Forgot password?
                             </button>
                        </div>
                    )}
                </>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-4">
                    <p className="text-center text-sm text-gray-600">
                        Code sent to <strong>{verificationEmail}</strong>
                    </p>
                    
                    <div>
                        <input type="text" placeholder="6-DIGIT OTP" maxLength="6"
                            className="w-full p-3 border-2 border-purple-100 rounded text-center text-xl font-bold tracking-widest text-gray-700 outline-none focus:border-purple-500"
                            value={formData.otp}
                            onChange={e => setFormData({...formData, otp: e.target.value})} required />
                    </div>

                    {view === 'forgot' && (
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">NEW PASSWORD</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="New strong password" 
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none pr-10"
                                    value={formData.newPassword}
                                    onChange={e => setFormData({...formData, newPassword: e.target.value})} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button type="submit" disabled={loading}
                className="bg-purple-600 text-white py-2.5 rounded font-medium hover:bg-purple-700 transition disabled:bg-purple-300 mt-2">
                {loading ? 'Processing...' : (
                    step === 1 ? (view === 'forgot' ? 'Send Reset Code' : (view === 'login' ? 'Login' : 'Sign Up')) 
                    : (view === 'forgot' ? 'Reset Password' : 'Verify & Enter')
                )}
            </button>
            
            {view === 'forgot' && step === 1 && (
                <button type="button" onClick={() => resetState('login')} 
                    className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 mt-2">
                    <ArrowLeft size={16} /> Back to Login
                </button>
            )}
        </form>

        {view !== 'forgot' && (
            <p className="mt-6 text-center text-sm text-gray-600">
                {view === 'login' ? "New to Hunt360?" : "Already have an account?"}{" "}
                <button className="text-purple-600 font-bold hover:underline"
                    onClick={() => resetState(view === 'login' ? 'signup' : 'login')}>
                    {view === 'login' ? 'Create Account' : 'Login'}
                </button>
            </p>
        )}
      </div>
    </div>
  );
};

export default Auth;