const fs = require('fs');
const SSHClient = require('ssh2').Client;
const utf8 = require('utf8');

const sshSocketConnection = (app, host, port, username, password, privateKey) => {
  // eslint-disable-next-line no-console
  const base64 = privateKey.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  app.get('_io').once('connection', function (socket) {
    const ssh = new SSHClient();
    ssh
      .once('ready', function () {
        socket.emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n');
        // eslint-disable-next-line no-unused-vars
        const connected = true;
        ssh.shell(function (err, stream) {
          if (err) return socket.emit('data', `\r\n*** SSH SHELL ERROR: ${err.message}***\r\n`);
          socket.on('data', function (data) {
            // eslint-disable-next-line no-console
            stream.write(data);
          });
          stream
            .on('data', function (d) {
              socket.emit('data', utf8.decode(d.toString('binary')));
            })
            .on('close', function () {
              ssh.end();
            });
        });
      })
      .on('close', function () {
        socket.emit('data', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
        socket.disconnect();
      })
      .on('error', function (err) {
        socket.emit('data', `\r\n*** SSH CONNECTION ERROR: ${err.message} ***\r\n`);
      })
      .connect({
        host,
        port,
        username,
        // password: 'PASSWORD' // Set password or use PrivateKey
        privateKey: buffer,
      });
  });
};

// 'ec2-3-15-141-160.us-east-2.compute.amazonaws.com'
// '22'
// 'ec2-user'
// fs.readFileSync('./src/services/shell-test.pem')

module.exports = {
  sshSocketConnection,
};
