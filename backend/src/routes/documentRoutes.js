const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protectRoute } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  downloadDocument,
} = require("../controllers/documentController");

router.post("/upload", protectRoute, upload.single("file"), uploadDocument);
router.get("/", protectRoute, getDocuments);
router.delete("/:id", protectRoute, deleteDocument);
router.get("/:id/download", protectRoute, downloadDocument);

module.exports = router;
