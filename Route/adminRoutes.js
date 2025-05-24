const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
} = require("../controller/adminController");

router.post("/adminlogin", loginAdmin);
router.post("/admins", createAdmin);
router.get("/admins", getAllAdmins);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

module.exports = router;
