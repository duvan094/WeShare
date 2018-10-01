var express = require('express'), router = express.Router();

require('./initDB');
router.use('/accounts', require('./account'));

module.exports = router;
