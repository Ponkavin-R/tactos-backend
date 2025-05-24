const express = require("express");
const router = express.Router();
const {
  createSector,
  getAllSectors,
  updateSector,
  deleteSector,
} = require("../controller/sectorController");

router.post("/sector", createSector);
router.get("/sector", getAllSectors);
router.put("/sector/:id", updateSector);
router.delete("/sector/:id", deleteSector);

module.exports = router;
