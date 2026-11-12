
import { useState, useEffect } from "react";
import "./DashboardPage.css";

const API_URL = "http://localhost:5000/api/files";

function DashboardPage({ onLogout }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("My Files");

  const fetchFiles = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Fetch files error:", error);
      alert("Unable to load files from server.");
    }
  };

  const fetchRecentFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/recent`);

      if (!response.ok) {
        throw new Error("Failed to fetch recent files");
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Fetch recent files error:", error);
      alert("Unable to load recent files from server.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleNavigation = async (page) => {
    setActivePage(page);

    if (page === "My Files") {
      await fetchFiles();
    } else if (page === "Recent") {
      await fetchRecentFiles();
    }
  };

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length === 0) return;

    setLoading(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }
      }

      alert("Files uploaded successfully!");

      if (activePage === "Recent") {
        await fetchRecentFiles();
      } else {
        await fetchFiles();
      }
    } catch (error) {
      alert(error.message || "File upload failed.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(
        `${API_URL}/download/${encodeURIComponent(filename)}`
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message || "Unable to download file.");
    }
  };

  const handleView = async (filename) => {
    try {
      const response = await fetch(
        `${API_URL}/download/${encodeURIComponent(filename)}`
      );

      if (!response.ok) {
        throw new Error("Unable to view file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      alert(error.message || "Unable to view file.");
    }
  };

  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${filename}?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert("File deleted successfully!");

      if (activePage === "Recent") {
        await fetchRecentFiles();
      } else {
        await fetchFiles();
      }
    } catch (error) {
      alert(error.message || "Unable to delete file.");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileType = (filename) => {
    return filename.split(".").pop().toUpperCase();
  };

  const totalBytes = files.reduce(
    (total, file) => total + file.size,
    0
  );

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h2>☁ CloudVault</h2>

        <nav>
          <p
            className={activePage === "My Files" ? "active" : ""}
            onClick={() => handleNavigation("My Files")}
            style={{ cursor: "pointer" }}
          >
            📁 My Files
          </p>

          <p
            className={activePage === "Recent" ? "active" : ""}
            onClick={() => handleNavigation("Recent")}
            style={{ cursor: "pointer" }}
          >
            🕒 Recent
          </p>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={onLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{activePage}</h1>
            <p>Welcome back to CloudVault!</p>
          </div>

          
        </header>

        <section className="storage-card">
          <div>
            <h3>Storage Overview</h3>
            <p>Manage your files in one place.</p>
          </div>

          <div className="storage-info">
            <div className="storage-bar">
              <div
                className="storage-used"
                style={{
                  width: `${Math.min(
                    (totalBytes / (10 * 1024 * 1024 * 1024)) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>

            <p>{formatSize(totalBytes)} used of 10 GB</p>
          </div>
        </section>

        <section className="dashboard-actions">
          <h2>
            {activePage === "Recent" ? "Recent Files" : "All Files"} (
            {files.length})
          </h2>

          <label className="upload-button">
            {loading ? "Uploading..." : "+ Upload Files"}

            <input
              type="file"
              multiple
              onChange={handleUpload}
              hidden
              disabled={loading}
            />
          </label>
        </section>

        <section className="file-list">
          <div className="file-list-header">
            <span>Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Action</span>
          </div>

          {files.map((file) => (
            <div className="file-row" key={file.name}>
              <span>📄 {file.name}</span>

              <span>{getFileType(file.name)}</span>

              <span>{formatSize(file.size)}</span>

              <div className="file-actions">
                <button
                  onClick={() => handleView(file.name)}
                  className="view-button"
                  title="View"
                  aria-label={`View ${file.name}`}
                >
                  👁
                </button>

                <button
                  onClick={() => handleDownload(file.name)}
                  className="download-button"
                  title="Download"
                  aria-label={`Download ${file.name}`}
                >
                  ⇩
                </button>

                <button
                  onClick={() => handleDelete(file.name)}
                  className="delete-button"
                  title="Delete"
                  aria-label={`Delete ${file.name}`}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <p className="empty-files">
              {activePage === "Recent"
                ? "No recent files available."
                : "No files available."}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
