import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '15px 30px', 
            background: 'var(--card-bg)', // 👈 Updated
            borderBottom: '1px solid var(--border-color)', // 👈 Updated
            color: 'var(--text-main)', // 👈 Updated
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
                🧠 Second Brain
            </div>
            <div>
                {token ? (
                    <button onClick={handleLogout} style={btnStyle('#dc3545', 'white')}>Logout</button>
                ) : (
                    <>
                        <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 'bold' }}>Login</Link>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <button style={btnStyle('#007BFF', 'white')}>Sign Up</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const btnStyle = (bg, color) => ({
    padding: '8px 16px', background: bg, color: color, 
    border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
});

export default Navbar;