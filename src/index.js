var express = require('express'), router = express.Router();

require('./initDB');
router.use('/accounts', require('./account'));
router.use('/groups', require('./group'));
router.use('/group-members', require('./group_member'));
router.use('/tokens', require('./tokens'));

module.exports = router;
