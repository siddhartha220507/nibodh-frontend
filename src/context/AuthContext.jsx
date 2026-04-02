import React, { createContext, useState, useContext } from 'react';

// 1. Context Create Karna (Yeh ek empty box hai jisme hum apna data rakhenge)
const AuthContext = createContext();

// 2. Provider Component (Yeh box poore App.jsx ke upar wrap hoga)
export const AuthProvider = ({ children }) => {
    
    // 🔥 Pro-Tip: useState ke andar function pass karne se React localStorage ko 
    // sirf pehli baar (app refresh hone par) padhta hai, baar-baar nahi.
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    // Login Function: Token ko State aur LocalStorage dono mein daalo
    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    // Logout Function: Token ko State aur LocalStorage dono se uda do
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    // Jo variables/functions baaki components ko chahiye, unko 'value' mein daal do
    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook (Taaki baaki components mein seedha `const { token } = useAuth()` likh sako)
export const useAuth = () => {
    return useContext(AuthContext);
};