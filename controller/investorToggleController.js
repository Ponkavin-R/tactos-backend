const InvestorToggle = require('../Schema/InvestorToggle');

// GET toggle state (create default if none)
exports.getToggle = async (req, res) => {
  try {
    let toggle = await InvestorToggle.findOne();
    if (!toggle) {
      toggle = await InvestorToggle.create({ enabled: false });
    }
    res.json(toggle);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch toggle', details: err.message });
  }
};

// PUT update toggle state
exports.updateToggle = async (req, res) => {
  try {
    let toggle = await InvestorToggle.findOne();
    if (!toggle) {
      toggle = new InvestorToggle();
    }
    toggle.enabled = req.body.enabled;
    await toggle.save();
    res.json(toggle);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update toggle', details: err.message });
  }
};
