import { useState } from "react";

export default function Decompress({ background, typeoffile = ".txt", back }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decompressStats, setDecompressStats] = useState(null);
  const [error, setError] = useState(null);

  const validateFile = (selectedFile) => {
    const validExtensions = {
      "image/*": [".huff", ".huff.huff", ".bmp.huff.huff"],
      "audio/*": [".huff"],
      ".txt": [".compressed"],
    };

    const fileExtension = selectedFile.name.toLowerCase();
    const validExts = validExtensions[typeoffile];

    if (!validExts) {
      setError("Unsupported file type");
      return false;
    }

    const isValid = validExts.some((ext) => fileExtension.endsWith(ext));
    if (!isValid) {
      setError(`Please select a valid compressed ${typeoffile.replace("/*", "")} file`);
      return false;
    }

    return true;
  };

  const handleFile = (event) => {
    setError(null);
    const selectedFile = event.target.files[0];

    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setDecompressStats(null);
    } else {
      setFile(null);
    }
  };

  const downloadFile = (data, filename, mimeType) => {
    const byteCharacters = atob(data);
    const byteArray = Uint8Array.from(byteCharacters, (char) => char.charCodeAt(0));
    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!file) {
      setError(`Please select a compressed ${typeoffile.replace("/*", "")} file first!`);
      return;
    }
  
    setLoading(true);
    setError(null);
    const formData = new FormData();
  
    // Use "file" for image/audio endpoints and "compressedFile" for text.
    const formDataKey = typeoffile === ".txt" ? "compressedFile" : "file";
    formData.append(formDataKey, file);
  
    try {
      const endpoint =
        typeoffile === "image/*"
          ? "image/decompress"
          : typeoffile === "audio/*"
          ? "audio/decompress"
          : "decompress/text";
  
      const response = await fetch(`http://localhost:8080/api/${endpoint}`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Decompression failed");
      }
  
      if (typeoffile === "audio/*") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
  
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file.name.replace(/\.huff$/, "")}.wav`; // Adjust the extension if necessary
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        setDecompressStats({ message: "Audio decompressed successfully!" });
      } else {
        const data = await response.json();
        setDecompressStats(data);
  
        const mimeType =
          typeoffile === "image/*"
            ? "image/bmp"
            : "text/plain";
        const fileExtension =
          typeoffile === "image/*"
            ? ".bmp"
            : ".txt";
  
        downloadFile(data.decompressedData, `${data.filename}${fileExtension}`, mimeType);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(`Decompression failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div
      className="upload-container"
      style={{ color: background === "whitebackground" ? "black" : "white" }}
    >
      <button className="back-button" onClick={back}>
        ← Go Back
      </button>
      <div className="upload-box">
        <h2 className="title">Decompress {typeoffile.replace("/*", "")}</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="upload-form" onSubmit={handleSubmit}>
          <label htmlFor="decompress-upload" className="file-label">
            Choose a compressed {typeoffile.replace("/*", "")} file
          </label>
          <input
            type="file"
            id="decompress-upload"
            onChange={handleFile}
            accept={
              typeoffile === "image/*"
                ? ".huff,.huff.huff,.bmp.huff.huff"
                : typeoffile === "audio/*"
                ? ".huff"
                : ".compressed"
            }
            className="file-input"
          />
          {file && (
            <p className="author-info">
              Selected File: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Decompressing..." : "Decompress File"}
          </button>
        </form>
      </div>
    </div>
  );
}
