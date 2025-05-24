const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const businessController = require('../controller/businessController');

router.post("/businessideationhub", upload.single("cv"), businessController.registerBusiness);
router.get("/businesses", businessController.getAllBusinesses);
router.delete("/businesses/:id", businessController.deleteBusiness);
router.put("/businesses/:id", businessController.updateBusinessStatus);

module.exports = router;