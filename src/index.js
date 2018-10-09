var express = require('express'), router = express.Router();

require('./initDB');
router.use('/accounts', require('./account'));
router.use('/groups', require('./group'));
router.use('/group-members', require('./group_member'));
router.use('/tokens', require('./tokens'));
router.use('/got-response-from-google', require('./third_party'));


module.exports = router;
