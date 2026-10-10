
import React, { useEffect, useState } from "react";
import API from "../services/api";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfileImageUpload({ userId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setError("");
    setFile(null);

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError("Image must be 2 MB or smaller.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || !userId) {
      setError("Please select a valid image and log in again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post(`/upload/${userId}`, formData);

      const newUrl = `${API_URL}${data.imageUrl}`;

      if (onUploadSuccess) {
        onUploadSuccess(newUrl);
      }

      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Select and Upload Profile Image</h3>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={loading}
      />

      {preview && <img src={preview} alt="Preview" width="200" />}

      {file && (
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      )}

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}
