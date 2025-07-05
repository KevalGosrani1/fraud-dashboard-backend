// models/Log.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  type: String,
  payload: Object,
  createdAt: Date
});

module.exports = mongoose.model('Log', LogSchema);
