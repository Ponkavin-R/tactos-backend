const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Multer middleware
const {
  registerCofounder,
  getAllCofounders,
  deleteCofounder,
  updateCofounderStatus
} = require('../controller/cofounderController');

// Register new cofounder
router.post('/cofounderregister', upload.single("resume"), registerCofounder);

// Get all cofounders
router.get('/cofounders', getAllCofounders);

// Delete cofounder by ID
router.delete('/cofounders/:id', deleteCofounder);

// Update hold status
router.put('/cofounders/:id/status', updateCofounderStatus);

module.exports = router;
