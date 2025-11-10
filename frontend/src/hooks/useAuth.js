import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; 

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [ isAuthenticated, setIsAuthenticated ] = useState(false);
    const [ user, setUser ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            setIsAuthenticated(true);
            setUser({ id: 'local', fullName: 'User', email: 'loading@...' });
        }
        
        setLoading(false);
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData); 
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
        {children}      
        </AuthContext.Provider>
    );
};