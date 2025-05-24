const Interest = require('../Schema/Interest');

exports.submitInterest = async (req, res) => {
  try {
    const { fundingId, type, name, email, phone } = req.body;

    if (!fundingId) {
      return res.status(400).json({ message: 'Funding ID is required' });
    }

    const newInterest = new Interest({
      fundingId,
      type,
      name,
      email,
      phone,
    });

    await newInterest.save();

    res.status(201).json({ message: 'Interest submitted successfully!' });
  } catch (error) {
    console.error('Error submitting interest:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
