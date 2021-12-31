const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { sshService, ec2Service } = require('../services');

const getConfig = catchAsync(async (req, res) => {
  const { user } = req;
  const config = await ec2Service.getConfigByUser(user);
  res.send(config);
});

const makeConnection = catchAsync(async (req, res) => {
  const { user } = req;
  const { host, username, privateKey, port, password } = req.body;
  let connectionConfig = await ec2Service.updateUserConfig(user, { host, port, username, password, privateKey });
  if (!connectionConfig) {
    connectionConfig = await ec2Service.saveConnectionConfig(user, host, port, username, password, privateKey);
  }
  await sshService.sshSocketConnection(req.app, host, port, username, password, privateKey);
  res.status(httpStatus.CREATED).send(connectionConfig);
});

module.exports = {
  makeConnection,
  getConfig,
};
