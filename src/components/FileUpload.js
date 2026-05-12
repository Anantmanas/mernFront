import React, { useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,text/plain";

const FileUpload = ({ onUploadSuccess, onError }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const openPicker = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/upload`,
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("authToken"),
          },
        },
      );
      onUploadSuccess?.(response.data);
    } catch (error) {
      const data = error?.response?.data;
      const message =
        data?.error ||
        data?.msg ||
        "Could not upload file. Try again.";
      onError?.(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="file-input-hidden"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleChange}
      />
      <button
        type="button"
        className="upload-btn"
        onClick={openPicker}
        disabled={uploading}
        aria-label={uploading ? "Uploading file" : "Upload file"}
        title={uploading ? "Uploading..." : "Upload image or document"}
      >
        {uploading ? "..." : "📎"}
      </button>
    </>
  );
};

export default FileUpload;
