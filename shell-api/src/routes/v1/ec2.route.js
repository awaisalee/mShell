const express = require('express');

const ec2Controller = require('../../controllers/ec2.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/connect_ec2', auth(), ec2Controller.makeConnection);
router.get('/get_config', auth(), ec2Controller.getConfig);

module.exports = router;
