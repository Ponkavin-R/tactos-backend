const Admin = require("../Schema/Admin");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email, password }); // Note: Plain text match
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", adminId: admin._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const newAdmin = new Admin({ email, password });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { email, password },
      { new: true }
    );
    if (!updatedAdmin) return res.status(404).json({ error: "Admin not found" });
    res.status(200).json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) return res.status(404).json({ error: "Admin not found" });
    res.status(200).json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
