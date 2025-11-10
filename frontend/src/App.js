import { AuthProvider, useAuth } from './hooks/useAuth.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage.js';  
import LoginPage from './pages/LoginPage.js';
import RegistrationPage from './pages/RegistrationPage.js';
import DashboardPage from './pages/DashboardPage.js';
import VerifyEmailPage from './pages/VerifyEmailPage.js';

// Placeholder components for protected routes
const ProfilePage = () => <div style={{ textAlign: 'center', marginTop: 50, color: '#1d3557' }}><h1>Profile Page - In progress</h1></div>;
const SettingsPage = () => <div style={{ textAlign: 'center', marginTop: 50, color: '#1d3557' }}><h1>Settings Page - In Progress</h1></div>;

// Component to protect route
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 50, color: 'white' }}>Checking Authentication...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            {/* Wrapping the whole app with AuthProvider making state available everywhere */}
            <AuthProvider>
                <Routes>
                 {/* Public route accessible to everyone */}
                 <Route path="/" element={<LandingPage/>} />
                 <Route path="/register" element={<RegistrationPage/>} />
                 <Route path="/login" element={<LoginPage/>} />
                 <Route path="/verify-email" element={<VerifyEmailPage/>} />
                {/* Protected routes only accessible if authenticated is true */}
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                {/* route to redirect any unknown path to the landing page */}
                <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
export default App;