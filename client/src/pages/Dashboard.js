import React, { useEffect, useState } from "react";
import API from "../services/api";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // ✅ ADD THIS

const SUPPORTED_EXTENSIONS = {
  js: "javascript",
  py: "python",
  java: "java",
};

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newFileTitle, setNewFileTitle] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const fileInputRef = React.useRef(null);

  /* ================= EXISTING LOGIC (UNCHANGED) ================= */

  const fetchFiles = async () => {
    const res = await API.get("/files");
    setFiles(res.data);
  };

  const fetchLanguages = async () => {
    const res = await API.get("/languages");
    setAvailableLanguages(res.data);
  };

  const openNewFileModal = () => {
    setNewFileTitle("");
    setNewFileLanguage("javascript");
    setShowModal(true);
  };

  const createFileWithDetails = async () => {
    if (!newFileTitle.trim()) return alert("Please enter file name");

    const res = await API.post("/files", {
      title: newFileTitle,
      language: newFileLanguage,
    });

    setShowModal(false);
    navigate(`/editor/${res.data._id}`);
  };

  const openLocalFile = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS[extension]) {
      alert("File type not supported");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const res = await API.post("/files", {
        title: file.name.replace(`.${extension}`, ""),
        language: SUPPORTED_EXTENSIONS[extension],
        code: e.target.result,
      });
      navigate(`/editor/${res.data._id}`);
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    await API.delete(`/files/${id}`);
    fetchFiles();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    fetchFiles();
    fetchLanguages();
  }, []);

  /* ================= UI STARTS HERE ================= */

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="topbar">
        <div className="brand">CodeCraft</div>

        <div className="top-actions">
          <button className="pill-btn" onClick={openNewFileModal}>
            ➕ New File
          </button>

          <button className="pill-btn" onClick={openLocalFile}>
            📂 Open File
          </button>

          <button className="pill-btn danger" onClick={handleLogout}>
            🚪 Logout
          </button>

        </div>
      </div>

      {/* ===== PROFILE CARD ===== */}
      <div className="profile-card">
        <div className="avatar">U</div>
        <div>
          <h2>Your Dashboard</h2>
          <p>Click a file to open it in the editor</p>
        </div>
      </div>

      {/* ===== FILE LIST ===== */}
      <div className="files-container">
        {files.length === 0 && (
          <p className="empty">No files created yet</p>
        )}

        {files.map((file) => (
          <div
            key={file._id}
            className="file-card"
            onClick={() => navigate(`/editor/${file._id}`)}
          >
            <div className="file-info">
                <strong>{file.title}</strong>
                <span className="lang">{file.language}</span>
              </div>


            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(file._id);
              }}
            >
              Delete
            </button>

          </div>
        ))}
      </div>

      {/* ===== HIDDEN FILE INPUT ===== */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Create New File</h3>

            <input
              placeholder="File name"
              value={newFileTitle}
              onChange={(e) => setNewFileTitle(e.target.value)}
            />

            <select
              value={newFileLanguage}
              onChange={(e) => setNewFileLanguage(e.target.value)}
            >
              {availableLanguages.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.label}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={createFileWithDetails}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;