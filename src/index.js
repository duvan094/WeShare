var express = require('express'), router = express.Router();

router.use('/init', require('./init'));
router.use('/account', require('./account'));

module.exports = router;
