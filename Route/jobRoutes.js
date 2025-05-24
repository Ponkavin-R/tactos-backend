const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  addJob,
  updateJob,
  deleteJob,
} = require('../controller/jobController');

router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', addJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

module.exports = router;
