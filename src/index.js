var express = require('express'), router = express.Router();

require('./initDB');
router.use('/account', require('./account'));

module.exports = router;
