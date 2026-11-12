
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
const metadataPath = path.join(__dirname, "../fileMetadata.json");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Metadata storage
const readMetadata = () => {
  try {
    if (!fs.existsSync(metadataPath)) {
      fs.writeFileSync(metadataPath, JSON.stringify({}));
    }

    return JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  } catch (error) {
    console.error("Metadata read error:", error);
    return {};
  }
};

const saveMetadata = (metadata) => {
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};

// Validate filename to prevent path traversal
const getFilePath = (filename) => {
  if (
    !filename ||
    filename !== path.basename(filename) ||
    filename.includes("..")
  ) {
    return null;
  }

  return path.join(uploadDir, filename);
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload file
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const metadata = readMetadata();

  metadata[req.file.filename] = {
    starred: false,
    trashed: false,
    uploadedAt: Date.now(),
  };

  saveMetadata(metadata);

  res.status(201).json({
    message: "File uploaded successfully",
    file: {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      starred: false,
      trashed: false,
      uploadedAt: metadata[req.file.filename].uploadedAt,
    },
  });
});

// List active files
router.get("/", (req, res) => {
  try {
    const metadata = readMetadata();
    const filenames = fs.readdirSync(uploadDir);

    const files = filenames
      .filter((filename) => {
        const filePath = getFilePath(filename);

        return (
          filePath &&
          fs.statSync(filePath).isFile() &&
          !metadata[filename]?.trashed
        );
      })
      .map((filename) => {
        const stats = fs.statSync(getFilePath(filename));

        return {
          name: filename,
          size: stats.size,
          starred: metadata[filename]?.starred || false,
          trashed: false,
        };
      });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to retrieve files" });
  }
});

// Get recent files
router.get("/recent", (req, res) => {
  try {
    const metadata = readMetadata();
    const filenames = fs.readdirSync(uploadDir);

    const files = filenames
      .filter((filename) => {
        const filePath = getFilePath(filename);

        return (
          filePath &&
          fs.statSync(filePath).isFile() &&
          !metadata[filename]?.trashed
        );
      })
      .map((filename) => {
        const filePath = getFilePath(filename);
        const stats = fs.statSync(filePath);

        return {
          name: filename,
          size: stats.size,
          starred: metadata[filename]?.starred || false,
          trashed: false,
          uploadedAt:
            metadata[filename]?.uploadedAt || stats.mtimeMs,
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt);

    res.json(files);
  } catch (error) {
    console.error("Recent files error:", error);

    res.status(500).json({
      message: "Unable to retrieve recent files",
    });
  }
});

// Get starred files
router.get("/starred", (req, res) => {
  try {
    const metadata = readMetadata();

    const files = Object.keys(metadata)
      .filter(
        (filename) =>
          metadata[filename].starred && !metadata[filename].trashed
      )
      .filter((filename) => fs.existsSync(getFilePath(filename)))
      .map((filename) => {
        const stats = fs.statSync(getFilePath(filename));

        return {
          name: filename,
          size: stats.size,
          starred: true,
          trashed: false,
        };
      });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve starred files" });
  }
});

// Get trash files
router.get("/trash", (req, res) => {
  try {
    const metadata = readMetadata();

    const files = Object.keys(metadata)
      .filter((filename) => metadata[filename].trashed)
      .filter((filename) => fs.existsSync(getFilePath(filename)))
      .map((filename) => {
        const stats = fs.statSync(getFilePath(filename));

        return {
          name: filename,
          size: stats.size,
          starred: metadata[filename].starred,
          trashed: true,
        };
      });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve trash files" });
  }
});

// Toggle starred status
router.patch("/star/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = getFilePath(filename);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const metadata = readMetadata();

  if (!metadata[filename]) {
    metadata[filename] = { starred: false, trashed: false };
  }

  if (metadata[filename].trashed) {
    return res.status(400).json({ message: "Cannot star a trashed file" });
  }

  metadata[filename].starred = !metadata[filename].starred;
  saveMetadata(metadata);

  res.json({
    message: metadata[filename].starred
      ? "File added to Starred"
      : "File removed from Starred",
    starred: metadata[filename].starred,
  });
});

// Download file
router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = getFilePath(filename);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const metadata = readMetadata();

  if (metadata[filename]?.trashed) {
    return res.status(400).json({ message: "Restore file before downloading" });
  }

  res.download(filePath);
});

// Move file to Trash (soft delete)
router.delete("/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = getFilePath(filename);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const metadata = readMetadata();

  if (!metadata[filename]) {
    metadata[filename] = { starred: false, trashed: false };
  }

  metadata[filename].trashed = true;
  saveMetadata(metadata);

  res.json({ message: "File moved to Trash successfully" });
});

// Restore file from Trash
router.post("/restore/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = getFilePath(filename);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const metadata = readMetadata();

  if (!metadata[filename]?.trashed) {
    return res.status(400).json({ message: "File is not in Trash" });
  }

  metadata[filename].trashed = false;
  saveMetadata(metadata);

  res.json({ message: "File restored successfully" });
});

// Permanently delete file from Trash
router.delete("/permanent/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = getFilePath(filename);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const metadata = readMetadata();

  if (!metadata[filename]?.trashed) {
    return res.status(400).json({
      message: "Move file to Trash before permanently deleting it",
    });
  }

  fs.unlinkSync(filePath);
  delete metadata[filename];
  saveMetadata(metadata);

  res.json({ message: "File permanently deleted" });
});

module.exports = router;
