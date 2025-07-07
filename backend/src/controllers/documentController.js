const Document = require("../models/documentModel");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const path = require("path");
const { fromPath } = require("pdf2pic");

// Extract text from an image using Tesseract OCR
async function extractTextWithOCR(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng", {
    logger: (m) => console.log(m),
  });
  return result.data.text || "No text found via OCR.";
}

exports.uploadDocument = async (req, res) => {
  let filePathToCleanup = null;

  try {
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePathToCleanup = file.path;
    const fileStats = await fs.stat(file.path);
    if (fileStats.size === 0) {
      return res.status(400).json({ message: "Uploaded file is empty" });
    }

    let content = "";

    // If file is a PDF, try extracting text. If not, fallback to OCR.
    if (file.mimetype === "application/pdf") {
      try {
        const buffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(buffer);
        content = pdfData.text.trim();

        if (!content) throw new Error("Empty PDF text");
      } catch (parseErr) {
        console.log("PDF parse failed, converting PDF to image for OCR...");

        const imageOutputPath = path.join(__dirname, "../temp");
        const pdf2pic = fromPath(file.path, {
          density: 150,
          saveFilename: "ocr-converted",
          savePath: imageOutputPath,
          format: "png",
          width: 800,
          height: 1000,
        });

        const result = await pdf2pic(1); // Convert first page
        content = await extractTextWithOCR(result.path);
      }
    }
    // If image
    else if (file.mimetype.startsWith("image/")) {
      content = await extractTextWithOCR(file.path);
    }
    // Unsupported
    else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const {
      title = "Untitled",
      category = "General",
      date,
      tags = [],
    } = req.body;

    if (!title.trim() || !category.trim()) {
      return res
        .status(400)
        .json({ message: "Title and category are required" });
    }

    const newDoc = await Document.create({
      userId,
      title,
      category,
      date: date || new Date().toISOString().split("T")[0],
      content: content || "No content extracted.",
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
      fileName: file.filename,
      filePath: file.path,
    });

    console.log("Document uploaded:", newDoc.id);
    res.status(201).json({ message: "Document uploaded", document: newDoc });
  } catch (err) {
    console.error("Upload error:", err.message || err);
    if (filePathToCleanup) {
      await fs
        .unlink(filePathToCleanup)
        .catch((cleanupErr) => console.error("Cleanup error:", cleanupErr));
    }
    res.status(500).json({ message: `Server error: ${err.message}` });
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
