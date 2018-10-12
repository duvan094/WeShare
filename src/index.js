const express = require('express'); //require the npm package 'express'

const router = express.Router(); // Used to export the module, that will be then used in another file.js


require('./initDB'); //require in initDB

//require in all the other js files and give them an url path 
router.use('/accounts', require('./account'));
router.use('/groups', require('./group'));
router.use('/group-members', require('./group_member'));
router.use('/tokens', require('./tokens'));
router.use('/got-response-from-google', require('./third_party'));

module.exports = router; //Export the module
