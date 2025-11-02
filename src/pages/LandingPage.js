import { Link } from "react-router-dom";
import '../App.css'; 

function LandingPage() {
    return (
        <>
        {/* Navbar section */}
        <nav className="navbar">
            <div className="logo">SecureCloud</div>
            <div className="nav-links">
                <Link to ="/" className="nav-item">Home</Link>
                <a href="#features" className="nav-item">Features</a>
                <a href="#about" className="nav-item">About</a>
                {/* styled as a button in css */}
                <Link to="/login" className="nav-item nav-login-btn">Login</Link>
            </div>
        </nav>

        {/* Hero section */}
        <section className="hero">
            <h1> Store Your Files Safely and Access Them Anywhere</h1>
            <p>
                SecureCloud is your modern, pivate, and reliable cloud storage solution.
                Upload, manage, and access your files anytime, anywhere, with peace of mind.
            </p>
            <div className="cta-buttons">
            {/* The cta buttons that are linked o registration and login pages */}
            <Link to="/register" className="cta-btn primary-btn">Get started</Link>
            <Link to="/login" className="cta-btn secondary-btn">Login</Link>
            </div>
        </section>
        

        {/* features section */}
        <section className="features-section" id="features">
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <div className="feature-title">Strong privacy</div>
                    <div className="feature-desc">Your files are private and only accessible by you. No one else can view your data.</div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">☁️</div>
                    <div className="feature-title">Anytime Access</div>
                    <div className="feature-desc">Access your files from any device, anywhere in the world, at any time.</div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-title">Fast & Reliable</div>
                    <div className="feature-desc">Enjoy quick uploads and downloads with a robust, always-on cloud infrastructure.</div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🗂️</div>
                    <div className="feature-title">Easy File Management</div>
                    <div className="feature-desc">Organize, upload, and delete your files with a simple, user-friendly dashboard.</div>
                </div>
            </section>

            {/* Footer section */}
            <footer>
                <div className="social-icons">
                    <span title="Twitter">🐦</span>
                    <span title="LinkedIn">💼</span>
                    <span title="Github">🐙</span>
                </div>
                <div>&copy; 2025 SecureCloud. All rights reserved.</div>
            </footer>
        </>
    );
}

export default LandingPage;