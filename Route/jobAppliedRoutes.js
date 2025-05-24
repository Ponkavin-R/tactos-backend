const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Assuming you're using multer
const {
  applyJob,
  getApplicationsByJob,
} = require('../controller/jobAppliedController');

router.post('/jobapplied', upload.single('resume'), applyJob);
router.get('/jobapplied/:jobId', getApplicationsByJob);

module.exports = router;
