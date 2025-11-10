import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import fileService from '../services/fileService.js';   

function DashboardPage() {
  const [files, setFiles] = useState([]); 
  const [passphrase, setPassphrase] = useState('');
  const [rememberPassphrase, setRememberPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hamburger menu state
  
  const navigate = useNavigate();
  
  const { user, logout } = useAuth(); 

  const userName = user?.fullName || user?.email || 'SecureCloud User'; 

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Prefill saved passphrase (if user opted in) - USER-SPECIFIC KEY
        const userEmail = user?.email || 'default';
        const passphraseKey = `sc_passphrase_${userEmail}`;
        const saved = localStorage.getItem(passphraseKey);
        if (saved) {
          setPassphrase(saved);
          setRememberPassphrase(true);
        }
        // Show one-time onboarding about passphrase on first dashboard visit
        const seen = localStorage.getItem('sc_onboard_seen');
        if (!seen) setInfoOpen(true);
        const list = await fileService.listFiles();
        // adapt fields to table format
        setFiles(
          list.map(f => ({
            id: f._id,
            fileName: f.fileName,
            size: f.fileSize > 1024 ? `${(f.fileSize/1024/1024).toFixed(1)} MB` : `${Math.round(f.fileSize/1024)} KB`,
            dateUploaded: f.uploadDate?.split('T')[0] ?? '',
          }))
        );
      } catch (e) {
        setError(e.message || 'Failed to load files');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Persist or clear passphrase based on user preference - USER-SPECIFIC
  React.useEffect(() => {
    try {
      const userEmail = user?.email || 'default';
      const passphraseKey = `sc_passphrase_${userEmail}`;
      if (rememberPassphrase && passphrase) {
        localStorage.setItem(passphraseKey, passphrase);
      } else {
        localStorage.removeItem(passphraseKey);
      }
    } catch {}
  }, [rememberPassphrase, passphrase, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }
    setError('');
    try {
      if (!passphrase) {
        setError('Enter a passphrase before uploading (it encrypts your file).');
        return;
      }
      setLoading(true);
      const { file: saved } = await fileService.uploadEncrypted(selectedFile, passphrase);
      setFiles(prev => [
        ...prev,
        {
          id: saved.id,
          fileName: saved.fileName,
          size: saved.fileSize > 1024 ? `${(saved.fileSize/1024/1024).toFixed(1)} MB` : `${Math.round(saved.fileSize/1024)} KB`,
          dateUploaded: saved.uploadDate?.split('T')[0] ?? '',
        },
      ]);
      setSelectedFile(null);
      // clear any file input value
      const input = document.getElementById('file-upload');
      if (input) input.value = '';
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDownload = async (id) => {
    setError('');
    try {
      if (!passphrase) {
        setError('Enter the same passphrase used during upload to decrypt.');
        return;
      }
      setLoading(true);
      const { blob, fileName } = await fileService.downloadAndDecrypt(id, passphrase);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      setLoading(true);
      await fileService.deleteById(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      setError(e.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hamburger menu button - only visible on mobile */}
      <button 
        className="hamburger-menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">SecureCloud</div>
        <nav className="nav-menu">
          <button type="button" className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button type="button" className="nav-item" onClick={() => setNotice('Profile is coming soon.')}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
          <button type="button" className="nav-item" onClick={() => setNotice('Settings is coming soon.')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
          <button onClick={handleLogout} className="nav-item logout">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </div>

      <main className="dashboard-main">
        <header className="dashboard-header">
            {/* Dynamic Greeting using the corrected userName variable */}
            <h1 className="dashboard-title">Welcome, {userName}!</h1>            
            <div className="notification-icon">🔔</div>
        </header>

        <div className="upload-section">
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="Enter passphrase (used to encrypt/decrypt)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              style={{ padding: '10px', width: '100%', maxWidth: 420, borderRadius: 8 }}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                id="remember-passphrase"
                type="checkbox"
                checked={rememberPassphrase}
                onChange={(e) => setRememberPassphrase(e.target.checked)}
              />
              <label htmlFor="remember-passphrase" style={{ color: '#444' }}>
                Remember this passphrase on this device
              </label>
            </div>
          </div>
          <div className="file-upload">
            <input type="file" id="file-upload" className="file-input" onChange={handleFileSelect} />
            <label htmlFor="file-upload" className="file-label">Choose file</label>
            <button className="upload-button" disabled={loading || !selectedFile} onClick={handleUploadClick}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {selectedFile && (
            <div style={{ marginTop: 8, color: '#555' }}>
              Selected: <strong>{selectedFile.name}</strong>
            </div>
          )}
          {error && <div style={{ color: '#e63946', marginTop: 12 }}>{error}</div>}
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
              {/* Conditional rendering for file list */}
              {files.length === 0 ? (
                  <tr className="table-row">
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          You haven't uploaded any files yet.
                      </td>
                  </tr>
              ) : (
                files.map((file, index) => (
                  <tr key={index} className="table-row">
                    <td>{file.fileName}</td>
                    <td>{file.size}</td>
                    <td>{file.dateUploaded}</td>
                    <td className="actions">
                      <button 
                        className="action-btn download" onClick={() => handleDownload(file.id)}>Download</button>
                      <button 
                        className="action-btn delete" onClick={() => handleDelete(file.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Simple onboarding modal for passphrase */}
      {infoOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', maxWidth: 600, width: '90%', borderRadius: 12, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>How your passphrase works</h3>
            <ul style={{ paddingLeft: 18, color: '#333' }}>
              <li>Your files are encrypted in your browser before upload using this passphrase.</li>
              <li>We never send or store the passphrase on the server—don’t lose it.</li>
              <li>You must use the same passphrase to download/decrypt later and on other devices.</li>
              <li>Optionally, check “Remember this passphrase” to store it locally on this device.</li>
            </ul>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                onClick={() => {
                  localStorage.setItem('sc_onboard_seen', '1');
                  setInfoOpen(false);
                }}
                className="upload-button"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple notice for coming soon features */}
      {notice && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#111827', color: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
          {notice}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;