const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const Document = require("../models/documentModel");
const cache = require("../lib/cacheHelper");

// Cache key prefix
const CACHE_PREFIX = "documents";

exports.uploadDocument = async (req, res) => {
  try {
    const redis = req.app.locals.redis;
    const file = req.file;
    const userId = req.user.id;

    if (!file || file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files allowed." });
    }

    const formData = new FormData();
    formData.append("file", fsSync.createReadStream(file.path));
    formData.append("apikey", "K86286744788957");
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");

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

    const parsedResult =
      ocrResponse.data?.ParsedResults?.[0]?.ParsedText?.trim();
    if (!parsedResult) {
      console.error("OCR response:", JSON.stringify(ocrResponse.data, null, 2));
      return res.status(400).json({
        message: "No text extracted from the uploaded file.",
        rawOCRResponse: ocrResponse.data,
      });
    }

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

    // Invalidate documents cache for this user
    await cache.delSafe(redis, `${CACHE_PREFIX}:${userId}`);

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
    const redis = req.app.locals.redis;
    const cacheKey = `${CACHE_PREFIX}:${req.user.id}`;

    let cachedDocs = await cache.getSafe(redis, cacheKey);
    if (cachedDocs) {
      console.log("Serving documents from cache");
      return res.json(JSON.parse(cachedDocs));
    }

    const documents = await Document.findAll({
      where: { userId: req.user.id },
    });

    await cache.setSafe(redis, cacheKey, 3600, JSON.stringify(documents));

    res.json(documents);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const redis = req.app.locals.redis;
    const userId = req.user.id;

    const document = await Document.findOne({
      where: { id: req.params.id, userId },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await fs
      .unlink(document.filePath)
      .catch((err) => console.error("File deletion error:", err));
    await document.destroy();

    // Invalidate documents cache for this user
    await cache.delSafe(redis, `${CACHE_PREFIX}:${userId}`);

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
