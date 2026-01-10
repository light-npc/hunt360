import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  
  // Added username to state
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    otp: '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (step === 1) {
            // Login Step 1
            await axios.post('/api/auth/login', { 
                email: formData.email, 
                password: formData.password 
            });
            setStep(2);
        } else {
            // Login Step 2 (MFA)
            const res = await axios.post('/api/auth/login-verify', {
                email: formData.email,
                otp: formData.otp
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        }
      } else {
        // Sign Up
        if (step === 1) {
            if (!validatePassword(formData.password)) {
                setError("Password must contain: 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char & 8+ length.");
                setLoading(false);
                return;
            }
            // Signup Step 1
            await axios.post('/api/auth/signup-init', { 
                ...formData, 
                captchaToken: "valid_token" 
            });
            setStep(2);
        } else {
            // Signup Step 2 (OTP)
            const res = await axios.post('/api/auth/signup-verify', {
                email: formData.email,
                otp: formData.otp
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Check console.');
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setStep(1);
      setError('');
      setFormData({ username: '', email: '', password: '', otp: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-blue-500"></div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
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
                    {/* Username Field - Only for Signup */}
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">USERNAME</label>
                            <input 
                                type="text" 
                                placeholder="johndoe" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">EMAIL ADDRESS</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">PASSWORD</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none pr-10"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="flex items-center gap-2 border p-3 rounded bg-gray-50 mt-1">
                            <input type="checkbox" required className="accent-purple-600 h-4 w-4" />
                            <span className="text-sm text-gray-600">I am not a robot</span>
                        </div>
                    )}
                </>
            )}

            {step === 2 && (
                <div className="text-center py-4">
                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                        <CheckCircle size={32} />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        We sent a 6-digit code to <br/><strong>{formData.email}</strong>
                    </p>
                    <input 
                        type="text" 
                        placeholder="000000" 
                        maxLength="6"
                        className="w-full p-3 border-2 border-purple-100 rounded text-center text-2xl font-bold tracking-[0.5em] text-gray-700 focus:border-purple-500 outline-none"
                        value={formData.otp}
                        onChange={e => setFormData({...formData, otp: e.target.value})}
                        required
                    />
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="bg-purple-600 text-white py-2.5 rounded font-medium hover:bg-purple-700 transition disabled:bg-purple-300 mt-2"
            >
                {loading ? 'Processing...' : (step === 1 ? (isLogin ? 'Login' : 'Sign Up') : 'Verify OTP')}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "New to Hunt360?" : "Already have an account?"}{" "}
            <button 
                className="text-purple-600 font-bold hover:underline"
                onClick={toggleMode}
            >
                {isLogin ? 'Create Account' : 'Login'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;