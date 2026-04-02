import { useNavigate } from 'react-router-dom'; 
import React, { useState } from 'react'; 
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion'; // 🔥 ANIMATION KE LIYE

const Login = () => {
    const [ email, setEmail] = useState("");
    const [ password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://nibodh-backend.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                login(data.user.token);
                toast.success('Welcome back to your Ni-Bodh Organized Learning');
                navigate('/');
            } else {
                toast.error(data.message || 'Login failed, please check your credentials.');
            }
        } catch (err) {
            toast.error('Server connect nahi ho raha!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            >
                <div className="auth-header">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to access your Ni-Bodh Organized Learning</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="auth-input"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="e.g. sid@nibodh.com"
                        />
                    </div>
                    
                    <div className="auth-input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="auth-input"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </motion.button>
                </form>
                
                <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Don't have an account? <span className="auth-link" onClick={() => navigate('/register')}>Create one now</span>
                </p>
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
        Enhance your experience with our companion tool
    </p>
    <a href="/nibodh-saver.zip" download className="ext-download-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Chrome Extension 🧩
    </a>
</div>

<p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}></p>
            </motion.div>
        </div>
    );
};

export default Login;