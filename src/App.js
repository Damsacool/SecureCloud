import { AuthProvider, useAuth } from './hooks/useAuth.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import all required pages (FIXED: singular LandingPage)
import LandingPage from './pages/LandingPage.js';  // <-- Fixed here (removed 's')
import LoginPage from './pages/LoginPage.js';
import RegistrationPage from './pages/RegistrationPage.js';
import DashboardPage from './pages/DashboardPage.js';
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









// import React from "react";
// import "./App.css";

// function App() {
//   return (
//     <div className="App">
//       {/* ===== NAVBAR ===== */}
//       <nav className="navbar">
//         <div className="logo">SecureCloud</div>
//         <ul className="nav-links">
//           <li>Home</li>
//           <li>Features</li>
//           <li>About</li>
//           <li>Login</li>
//         </ul>
//       </nav>

//       {/* ===== HERO SECTION ===== */}
//       <section className="hero">
//         <h1>Store Your Files Safely and Access Them Anywhere</h1>
//         <p>
//           SecureCloud is your modern, private, and reliable cloud storage
//           solution. Upload, manage, and access your files anytime, anywhere, with peace of mind.
//         </p>
//         <div className="hero-buttons">
//           <button className="btn-primary">Get Started</button>
//           <button className="btn-secondary">Login</button>
//         </div>
//       </section>

//       {/* ===== FEATURES ===== */}
//       <section className="features">
//         <div className="feature-card">
//           <span className="icon">🔒</span>
//           <h3>Strong Privacy</h3>
//           <p>Your files are private and only accessible by you. No one else can view your data.</p>
//         </div>

//         <div className="feature-card">
//           <span className="icon">☁️</span>
//           <h3>Anytime Access</h3>
//           <p>Access your files from any device, anywhere in the world, at any time.</p>
//         </div>

//         <div className="feature-card">
//           <span className="icon">⚡</span>
//           <h3>Fast & Reliable</h3>
//           <p>Enjoy quick uploads and downloads with a robust, always-on cloud infrastructure.</p>
//         </div>

//         <div className="feature-card">
//           <span className="icon">🗂️</span>
//           <h3>Easy File Management</h3>
//           <p>Organize, upload, and delete your files with a simple, user-friendly dashboard.</p>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default App;


