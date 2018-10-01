var express = require('express'), router = express.Router();

router.use('/initDB', require('./initDB'));
router.use('/account', require('./account'));

module.exports = router;
