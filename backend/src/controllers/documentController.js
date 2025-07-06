const Document = require("../models/documentModel");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const path = require("path");
const { fromPath } = require("pdf2pic");

// Helper function for OCR text extraction
async function extractTextWithOCR(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, "eng");
    return result.data.text || "No text found via OCR.";
  } catch (err) {
    console.error("OCR Error:", err);
    return "Failed to extract text via OCR.";
  }
}

// Helper function for PDF content extraction
async function extractPDFContent(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(buffer);
    return pdfData.text.trim();
  } catch (err) {
    console.log("PDF parse failed, falling back to OCR...");
    return null;
  }
}

// Helper function for PDF to image conversion
async function convertPDFToImage(filePath) {
  try {
    const outputPath = path.join(__dirname, "../temp");
    const pdf2pic = fromPath(filePath, {
      density: 150,
      saveFilename: "ocr-converted",
      savePath: outputPath,
      format: "png",
      width: 800,
      height: 1000,
    });
    return await pdf2pic(1); // Convert first page
  } catch (err) {
    console.error("PDF to image conversion failed:", err);
    throw err;
  }
}

exports.uploadDocument = async (req, res) => {
  const {
    title = "Untitled",
    category = "General",
    date,
    tags = [],
  } = req.body;
  const file = req.file;
  const userId = req.user.id;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Validate file
    const fileStats = await fs.stat(file.path);
    if (fileStats.size === 0) {
      await fs.unlink(file.path);
      return res.status(400).json({ message: "Uploaded file is empty" });
    }

    // Validate required fields
    if (!title.trim() || !category.trim()) {
      await fs.unlink(file.path);
      return res
        .status(400)
        .json({ message: "Title and category are required" });
    }

    // Extract content based on file type
    let content = "";
    if (file.mimetype === "application/pdf") {
      content = await extractPDFContent(file.path);
      if (!content) {
        const imageResult = await convertPDFToImage(file.path);
        content = await extractTextWithOCR(imageResult.path);
      }
    } else if (file.mimetype.startsWith("image/")) {
      content = await extractTextWithOCR(file.path);
    }

    // Create document record
    const newDoc = await Document.create({
      userId,
      title,
      category,
      date: date || new Date().toISOString().split("T")[0],
      content: content || "Failed to extract content",
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
      fileName: file.filename,
      filePath: file.path,
    });

    res.status(201).json({ message: "Document uploaded", document: newDoc });
  } catch (err) {
    console.error("Upload error:", err);
    await fs.unlink(file.path).catch(console.error);
    res.status(500).json({ message: "Failed to process document" });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      attributes: { exclude: ["content"] }, // Exclude large content field
    });
    res.json(documents);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ message: "Failed to fetch documents" });
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

    await fs.unlink(document.filePath).catch(console.error);
    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ message: "Failed to delete document" });
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
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return res.status(404).json({ message: "File not found on server" });
    }

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
    console.error("Error downloading document:", err);
    res.status(500).json({ message: "Failed to download document" });
  }
};
