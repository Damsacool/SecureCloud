import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const [files, setFiles] = useState([
    // Sample data - will be replaced with real data from backend
    {
      fileName: 'ProjectReport.pdf',
      size: '1.2 MB',
      dateUploaded: '2025-05-13'
    },
    {
      fileName: 'pfp.jpg',
      size: '800 KB',
      dateUploaded: '2025-05-12'
    }
  ]);
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Format the size to KB or MB as appropriate
      const sizeInKB = file.size / 1024;
      const sizeString = sizeInKB > 1024 
        ? `${(sizeInKB / 1024).toFixed(1)} MB` 
        : `${Math.round(sizeInKB)} KB`;

      const newFile = {
        fileName: file.name,
        size: sizeString,
        dateUploaded: new Date().toISOString().split('T')[0]
      };

      console.log('New file:', newFile); // Debug log
      setFiles(prevFiles => [...prevFiles, newFile]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDownload = (fileName) => {
    // This will be replaced with actual download logic
    console.log(`Downloading ${fileName}`);
  };

  const handleDelete = (fileName) => {
    // This will be replaced with actual delete logic
    setFiles(files.filter(file => file.fileName !== fileName));
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="logo">SecureCloud</div>
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">👤</span>
            Profile
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            Settings
          </a>
          <button onClick={handleLogout} className="nav-item logout">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </div>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, DarkSecCool!</h1>
          <div className="notification-icon">🔔</div>
        </header>

        <div className="upload-section">
          <div className="file-upload">
            <input
              type="file"
              id="file-upload"
              className="file-input"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="file-label">
              Choose file
            </label>
            <button className="upload-button">Upload</button>
          </div>
        </div>

        <div className="files-section">
          <h2>Your Uploaded Files</h2>
          <table className="files-table">
            <thead>
              <tr className="table-header">
                <th>File Name</th>
                <th>Size</th>
                <th>Date Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index} className="table-row">
                  <td>{file.fileName}</td>
                  <td>{file.size}</td>
                  <td>{file.dateUploaded}</td>
                  <td className="actions">
                    <button 
                      className="action-btn download"
                      onClick={() => handleDownload(file.fileName)}
                    >
                      Download
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(file.fileName)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
