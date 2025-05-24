const express = require("express");
const router = express.Router();
const {
  getInvestors,
  addInvestor,
  updateInvestor,
  deleteInvestor,
} = require("../controller/investorController");

router.get("/ourinvestors", getInvestors);
router.post("/ourinvestors", addInvestor);
router.put("/ourinvestors/:id", updateInvestor);
router.delete("/ourinvestors/:id", deleteInvestor);

module.exports = router;
