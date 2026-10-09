import React, { useState } from "react";
import API from "../services/api";

export default function ProfileImageUpload({ userId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post(`/upload/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const newUrl = `http://localhost:5000${data.imageUrl}`;

      // ✅ notify parent (App.js) to update avatar immediately
      if (onUploadSuccess) onUploadSuccess(newUrl);

      // clear preview after upload
      setPreview(null);
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Select and Upload Profile Image</h3>
      <input type="file" onChange={handleFileChange} />
      {preview && <img src={preview} alt="preview" width="200" />}
      {file && <button onClick={handleUpload}>Upload</button>}
    </div>
  );
}


