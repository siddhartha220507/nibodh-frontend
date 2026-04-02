import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion'; // 🔥 ANIMATION

const Register = () => {
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://nibodh-backend.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }) 
            });
            const data = await response.json();
            
            if (response.ok) {
                login(data.user.token);
                toast.success('Account created! Welcome to Ni-Bodh Organized Learning');
                navigate('/');
            } else {
                toast.error(data.message || 'Registration failed, check your input');
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
                initial={{ opacity: 0, x: 40 }} // Register page thoda right se slide hoga
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            >
                <div className="auth-header">
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Start building your Ni-Bodh Organized Learning today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            className="auth-input"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="e.g. Siddhartha Singh"
                        />
                    </div>

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
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </motion.button>
                </form>
                
                <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Login here</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;