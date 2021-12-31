const mongoose = require('mongoose');

const serverConfigSchema = mongoose.Schema({
  host: {
    type: String,
    required: true,
    trim: true,
  },
  port: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  keyFile: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const ServerConfig = mongoose.model('ServerConfig', serverConfigSchema);

module.exports = ServerConfig;
