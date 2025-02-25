import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/upload.css';

export default function Upload({
  background = '#fff',
  typeoffile,
  back,
  text = 'Upload',
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);
  const [error, setError] = useState(null);

  const allowedTypes = {
    'image/*': ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],
    '.txt': ['text/plain'],
    'audio/*': ['audio/wav', 'audio/wave', 'audio/x-wav'],
  };

  const validateFile = (selectedFile) => {
    const validTypes = allowedTypes[typeoffile];
    if (!validTypes) {
      setError('Unsupported file type');
      return false;
    }

    if (!validTypes.includes(selectedFile.type)) {
      setError(`Please select a valid ${typeoffile.replace('/*', '')} file`);
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB max size
    if (selectedFile.size > maxSize) {
      setError('File size too large. Maximum size is 50MB.');
      return false;
    }

    return true;
  };

  const handleFile = (event) => {
    setError(null);
    const selectedFile = event.target.files[0];

    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setCompressionStats(null);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError(`Please select a ${typeoffile.replace('/*', '')} file first!`);
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = typeoffile === 'image/*'
        ? 'image/compress'
        : typeoffile === 'audio/*'
        ? 'audio/compress'
        : 'compress/text';

      const response = await fetch(`http://localhost:8080/api/${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: typeoffile === 'audio/*' ? 'application/octet-stream' : 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      let data;
      if (typeoffile === 'audio/*') {
        const blob = await response.blob();
        const originalSize = file.size;
        const compressedSize = blob.size;
        data = {
          compressedData: await blob.arrayBuffer(),
          filename: file.name.split('.')[0],
          originalSize,
          compressedSize,
          compressionRatio: (1 - compressedSize / originalSize) * 100,
        };
      } else {
        data = await response.json();
      }

      if (!data.compressedData) {
        throw new Error('No compression data received');
      }

      setCompressionStats(data);
      const extension = typeoffile === 'audio/*' || typeoffile === 'image/*' ? '.huff' : '.compressed';
      await downloadFile(data.compressedData, `${data.filename}${extension}`);
      alert(`${typeoffile.replace('/*', '')} compressed and downloaded successfully!`);
    } catch (error) {
      console.error('Error:', error);
      setError(`Compression failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (data, filename) => {
    try {
      let blob;
      if (data instanceof ArrayBuffer) {
        blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
      } else {
        const byteCharacters = atob(data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        blob = new Blob([byteArray], { type: 'application/octet-stream' });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error('Failed to download the compressed file: ' + err.message);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (typeoffile) {
      case 'image/*':
        return '.jpg,.jpeg,.png,.gif,.bmp';
      case 'audio/*':
        return '.wav';
      default:
        return '.txt';
    }
  };

  return (
    <div className="upload-container" style={{ color: background === 'whitebackground' ? 'black' : 'white' }}>
      <button className="back-button" onClick={back}>
        ← Go Back
      </button>
      <div className="upload-box">
        <h2 className="title">{text} - Upload</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="upload-form" onSubmit={handleSubmit}>
          <label htmlFor="file-upload" className="file-label">
            Choose a {typeoffile.replace('/*', '')} file
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFile}
            accept={getAcceptedFileTypes()}
            className="file-input"
          />
          {file && (
            <p className="author-info">
              <span className="author-name">Selected File:</span> {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
          {compressionStats && (
            <div className="stats-info">
              <p>Original Size: {(compressionStats.originalSize / 1024).toFixed(2)} KB</p>
              <p>Compressed Size: {(compressionStats.compressedSize / 1024).toFixed(2)} KB</p>
              <p>
                Compression Ratio: 
                {typeof compressionStats.compressionRatio === 'number'
                  ? compressionStats.compressionRatio.toFixed(2)
                  : 'N/A'}%
              </p>
            </div>
          )}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : text}
          </button>
        </form>
      </div>
    </div>
  );
}

Upload.propTypes = {
  background: PropTypes.string,
  typeoffile: PropTypes.string.isRequired,
  back: PropTypes.func.isRequired,
  text: PropTypes.string,
};
