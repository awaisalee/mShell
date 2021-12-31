const httpStatus = require('http-status');
const { ServerConfig } = require('../models');
const ApiError = require('../utils/ApiError');

const saveConnectionConfig = async (user, host, port, username, password, privateKey) => {
  const configBody = {
    host,
    port,
    username,
    password,
    keyFile: privateKey,
    user: user._id,
  };
  return ServerConfig.create(configBody);
};

const getConfigByUser = async (user) => {
  const config = ServerConfig.findOne({ user: user._id });
  if (!config) throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  return config;
};

const updateUserConfig = async (user, config) => {
  const updatedConfig = ServerConfig.findOneAndUpdate({ user: user._id }, config, { useFindAndModify: false });
  if (!updatedConfig) throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  return updatedConfig;
};

module.exports = {
  getConfigByUser,
  saveConnectionConfig,
  updateUserConfig,
};

// host: 'ec2-3-15-141-160.us-east-2.compute.amazonaws.com',
//     username: 'ec2-user',
//     privateKey: fs.readFileSync('./shell-test.pem'),
//     port: 22,
