import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Strength State
  const [pwdCriteria, setPwdCriteria] = useState({
      length: false, upper: false, lower: false, number: false, special: false
  });

  const handlePasswordChange = (val) => {
      setNewPassword(val);
      setPwdCriteria({
          length: val.length >= 8,
          upper: /[A-Z]/.test(val),
          lower: /[a-z]/.test(val),
          number: /[0-9]/.test(val),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
      });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setMessage('');
      setLoading(true);

      // Validate checklist
      const isValid = Object.values(pwdCriteria).every(Boolean);
      if (!isValid) {
          setError("Please meet all password requirements.");
          setLoading(false);
          return;
      }

      try {
          // If you are using the Link flow:
          if (token) {
             await axios.post('/api/auth/reset-password', { token, newPassword });
          } 
          // If you are using the OTP flow (fallback if token is missing/logic differs):
          else {
             throw new Error("Invalid reset session.");
          }
          
          setMessage("Password reset successfully!");
          setTimeout(() => navigate('/auth'), 3000); // Redirect to login after 3s
      } catch (err) {
          setError(err.response?.data?.message || 'Failed to reset password.');
      } finally {
          setLoading(false);
      }
  };

  // Helper for checklist
  const RequirementItem = ({ met, text }) => (
      <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-400' : 'text-gray-500'}`}>
          {met ? <Check size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-700"></div>}
          <span>{text}</span>
      </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center font-sans">
       {/* Reuse Background */}
       <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 animate-bg-motion" 
            style={{ backgroundImage: 'url("/assets/tech-map.jpg")', backgroundSize: 'cover' }}></div>
         <div className="absolute inset-0 bg-black/70"></div>
       </div>

       <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
              
              <h2 className="text-2xl font-bold mb-2 text-center text-white">Reset Password</h2>
              <p className="text-gray-400 text-center text-sm mb-6">Enter your new password below.</p>

              {error && <div className="bg-red-500/20 text-red-100 p-3 rounded mb-4 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
              {message && <div className="bg-green-500/20 text-green-100 p-3 rounded mb-4 text-sm flex gap-2"><Check size={16}/>{message}</div>}

              {!message && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-blue-300 mb-2 tracking-wider">NEW PASSWORD</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="New strong password"
                                className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                value={newPassword}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-1">
                            <RequirementItem met={pwdCriteria.length} text="At least 8 characters" />
                            <RequirementItem met={pwdCriteria.upper} text="One uppercase letter" />
                            <RequirementItem met={pwdCriteria.lower} text="One lowercase letter" />
                            <RequirementItem met={pwdCriteria.number} text="One number" />
                            <RequirementItem met={pwdCriteria.special} text="One special character" />
                        </div>
                      </div>

                      <button type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50">
                        {loading ? 'Resetting...' : 'Set New Password'}
                      </button>
                  </form>
              )}
          </div>
       </div>
    </div>
  );
};

export default ResetPassword;