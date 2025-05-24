const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
});

const Clientsay = mongoose.model("Clientsay", ClientSchema);

module.exports = Clientsay;
