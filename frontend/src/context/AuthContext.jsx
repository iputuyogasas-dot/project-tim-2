import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('admin_data');
        if (stored) {
            try { setAdmin(JSON.parse(stored)); } catch { }
        }
    }, []);

    const login = (token, adminData) => {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_data', JSON.stringify(adminData));
        setAdmin(adminData);
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
