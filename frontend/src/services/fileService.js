import axios from 'axios';
import CryptoJS from 'crypto-js';

const API = process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api/files`
    : 'http://localhost:4000/api/files';

// Helpers
const arrayBufferToWordArray = (ab) => {
  const u8 = new Uint8Array(ab);
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      (u8[i] << 24) | (u8[i + 1] << 16) | (u8[i + 2] << 8) | (u8[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
};

const authHeader = () => {
  const token = localStorage.getItem('authToken');
  return { Authorization: `Bearer ${token}` };
};

// Public API
const fileService = {
  // Encrypt file bytes with AES(passphrase) and upload JSON to backend
  uploadEncrypted: async (file, passphrase) => {
    if (!file) throw new Error('No file selected');
    if (!passphrase) throw new Error('A passphrase is required to encrypt');

    // Read file as ArrayBuffer
    const buf = await file.arrayBuffer();
    const wordArray = arrayBufferToWordArray(buf);

    // Encrypt (CipherText as base64 string)
    const encrypted = CryptoJS.AES.encrypt(wordArray, passphrase).toString();

    const payload = {
      fileName: file.name,
      fileSize: file.size,
      encryptedContent: encrypted,
    };

    const { data } = await axios.post(`${API}/upload`, payload, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
    return data; // { message, file }
  },

  // Return list: [ { _id, fileName, fileSize, uploadDate } ]
  listFiles: async () => {
    const { data } = await axios.get(`${API}/list`, {
      headers: authHeader(),
    });
    return data;
  },

  // Download encrypted content JSON, then decrypt with passphrase
  downloadAndDecrypt: async (id, passphrase) => {
    if (!passphrase) throw new Error('Passphrase is required to decrypt');
    const { data } = await axios.get(`${API}/download/${id}`, {
      headers: authHeader(),
    });
    const { encryptedContent, fileName } = data;

    // Decrypt: we get a WordArray; convert to Uint8Array for Blob
    const decryptedWA = CryptoJS.AES.decrypt(encryptedContent, passphrase);
    // Convert WordArray to Uint8Array
    const words = decryptedWA.words;
    const sigBytes = decryptedWA.sigBytes;
    const u8 = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
      u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    // Download as a blob
    const blob = new Blob([u8]);
    return { blob, fileName };
  },

  // Delete file by id
  deleteById: async (id) => {
    const { data } = await axios.delete(`${API}/delete/${id}`, {
      headers: authHeader(),
    });
    return data; // { message }
  },
};

export default fileService;