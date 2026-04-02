import { useState, useEffect } from 'react' 
import React from 'react'
// 👇 NAYA: useLocation import kiya hai
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom' 
import { AuthProvider , useAuth } from './context/AuthContext'
// 🔥 NAYA: Framer Motion import kiya
import { AnimatePresence, motion } from 'framer-motion'; 

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GraphView from './pages/GraphView';

import './index.css';

const PrivateRoute = ({ children }) => {
  const {token} = useAuth()
  return token ? children : <Navigate to="/login" />
}

// 🔥 NAYA COMPONENT: Ye component page change hone par smooth animation dega
const AnimatedRoutes = () => {
  const location = useLocation();

  const pageAnimation = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<motion.div {...pageAnimation}><Login /></motion.div>} />
        <Route path="/register" element={<motion.div {...pageAnimation}><Register /></motion.div>} />
        <Route path="/graph" element={<PrivateRoute><motion.div {...pageAnimation} style={{ height: '100vh' }}><GraphView /></motion.div></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><motion.div {...pageAnimation} style={{ height: '100vh' }}><Dashboard /></motion.div></PrivateRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <AuthProvider>
      <Router>
        {/* 🔥 PREMIUM GLOWING DRIBBLE TOGGLE */}
        <div className="theme-toggle-container">
          <div className="premium-toggle" onClick={toggleTheme}>
            <div className="premium-slider"></div>
            <svg className={`toggle-icon ${!isDarkMode ? 'active' : ''}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
            </svg>
            <svg className={`toggle-icon ${isDarkMode ? 'active' : ''}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          </div>
        </div>
        
        {/* 👇 ANIMATED ROUTES RENDER */}
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;