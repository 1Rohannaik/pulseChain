const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const Document = require("../models/documentModel");

exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;

    // Validate uploaded file
    if (!file || file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files allowed." });
    }

    // Prepare file for OCR.Space API
    const formData = new FormData();
    formData.append("file", fsSync.createReadStream(file.path));
    formData.append("apikey", "K86286744788957");
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");

    // OCR.Space API request
    let ocrResponse;
    try {
      ocrResponse = await axios.post(
        "https://api.ocr.space/parse/image",
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
        }
      );
    } catch (ocrError) {
      console.error(
        "OCR API error:",
        ocrError.response?.data || ocrError.message
      );
      return res.status(502).json({
        message: "OCR processing failed. Please try again later.",
        error: ocrError.message,
      });
    }

    // Check OCR result structure
    const parsedResult =
      ocrResponse.data?.ParsedResults?.[0]?.ParsedText?.trim();
    if (!parsedResult) {
      console.error("OCR response:", JSON.stringify(ocrResponse.data, null, 2));
      return res.status(400).json({
        message: "No text extracted from the uploaded file.",
        rawOCRResponse: ocrResponse.data,
      });
    }

    // Metadata from request
    const {
      title = "Untitled",
      category = "General",
      date,
      tags = [],
    } = req.body;

    let tagList;
    try {
      tagList = Array.isArray(tags) ? tags : JSON.parse(tags || "[]");
    } catch (parseErr) {
      return res.status(400).json({
        message: "Invalid tags format. Must be an array or JSON string.",
      });
    }

    // Save document in DB
    const newDoc = await Document.create({
      userId,
      title: title.trim(),
      category: category.trim(),
      date: date || new Date().toISOString().split("T")[0],
      content: parsedResult,
      tags: tagList,
      fileName: file.filename,
      filePath: file.path,
    });

    return res.status(201).json({
      message: "Document uploaded successfully.",
      document: newDoc,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      message: "Internal server error. Upload failed.",
      error: err.message,
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
      document.fileName.endsWith(".pdf") ? "application/pdf" : "image/*"
    );
    res.sendFile(filePath);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};
