const Document = require("../models/documentModel");
const pdfParse = require("pdf-parse");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["application/pdf"];
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Ensure uploads directory exists
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(err => {
  console.error("Failed to create uploads directory:", err);
});

exports.uploadDocument = async (req, res) => {
  let tempFilePath = null;

  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { file, user, body } = req;
    tempFilePath = file.path;

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ message: "Only PDF files are supported" });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "File size exceeds 10MB limit" });
    }

    // Process PDF content
    let content = "";
    try {
      const buffer = await fs.readFile(file.path);
      const pdfData = await pdfParse(buffer);
      content = pdfData.text.trim();
      
      if (!content) {
        return res.status(400).json({ message: "PDF contains no extractable text" });
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid PDF file" });
    }

    // Validate and sanitize inputs
    const title = validator.escape(body.title || "Untitled").substring(0, 255);
    const category = validator.escape(body.category || "General").substring(0, 100);
    
    let tags = [];
    if (body.tags) {
      try {
        tags = Array.isArray(body.tags) 
          ? body.tags.map(tag => validator.escape(tag))
          : JSON.parse(body.tags).map(tag => validator.escape(tag));
      } catch (e) {
        tags = [];
      }
    }

    // Validate date or use current date
    const date = body.date && !isNaN(new Date(body.date).getTime())
      ? new Date(body.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    const finalFilePath = path.join(UPLOADS_DIR, uniqueFilename);

    // Move file to permanent location
    await fs.rename(file.path, finalFilePath);

    // Create document record
    const newDoc = await Document.create({
      userId: user.id,
      title,
      category,
      date,
      content,
      tags,
      fileName: uniqueFilename,
      filePath: finalFilePath,
    });

    res.status(201).json({ 
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: newDoc.id,
        title: newDoc.title,
        category: newDoc.category,
        date: newDoc.date
      }
    });

  } catch (err) {
    console.error("Upload error:", err);
    
    // Cleanup temp file if error occurred
    if (tempFilePath) {
      fs.unlink(tempFilePath).catch(cleanupErr => 
        console.error("Cleanup error:", cleanupErr)
      );
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to process document" 
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'title', 'category', 'date', 'tags', 'createdAt']
    });
    
    res.json({ success: true, documents });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch documents" 
    });
  }
};

exports.deleteDocument = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction
    });

    if (!document) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: "Document not found" 
      });
    }

    // Delete file
    await fs.unlink(document.filePath)
      .catch(err => console.error("File deletion warning:", err));

    // Delete record
    await document.destroy({ transaction });
    await transaction.commit();

    res.json({ 
      success: true,
      message: "Document deleted successfully" 
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Delete error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete document" 
    });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: "Document not found" 
      });
    }

    // Check file exists
    try {
      await fs.access(document.filePath);
    } catch (err) {
      return res.status(404).json({ 
        success: false,
        message: "File not found" 
      });
    }

    // Set headers
    const filename = `${document.title}${path.extname(document.fileName)}`;
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Content-Type", "application/pdf");

    // Stream file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to download document" 
    });
  }
};
