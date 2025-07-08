const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path"); /
const axios = require("axios");
const FormData = require("form-data");
const Document = require("../models/documentModel");

exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;

    // Validate uploaded file
    if (!file || file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files allowed" });
    }

    // Prepare file to send to OCR microservice
    const formData = new FormData();
    formData.append("file", fsSync.createReadStream(file.path));

    // Send file to FastAPI OCR service
    const ocrResponse = await axios.post(
      "http://localhost:8000/extract-text", // Change to deployed OCR URL in production
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
      }
    );

    const content = ocrResponse.data?.document?.content?.trim();
    if (!content) {
      throw new Error("No text extracted from PDF.");
    }

    // Get metadata
    const {
      title = "Untitled",
      category = "General",
      date,
      tags = [],
    } = req.body;

    // Create document in DB
    const newDoc = await Document.create({
      userId,
      title: title.trim(),
      category: category.trim(),
      date: date || new Date().toISOString().split("T")[0],
      content,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
      fileName: file.filename,
      filePath: file.path,
    });

    res.status(201).json({
      message: "Document uploaded",
      document: newDoc,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({
      message: "Upload failed. Try with a different PDF.",
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
    });
    res.json(documents);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await fs
      .unlink(document.filePath)
      .catch((err) => console.error("File deletion error:", err));
    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.resolve(document.filePath);
    await fs.access(filePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.fileName}"`
    );
    res.setHeader(
      "Content-Type",
      document.fileName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"
    );
    res.sendFile(filePath);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};
