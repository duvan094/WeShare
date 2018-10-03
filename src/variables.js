const jwt = require('jsonwebtoken');

const saltRounds = 10;//How many times the password is hashed
const serverSecret = "jacobjhaskjhdjakhdkahdjakasdoliver"; //

const appId = "2633953939951775";
const appSecret = "9d3c87c652a23473635ab66bdbd90e25";

exports.jwt = jwt;

exports.saltRounds = saltRounds;
exports.serverSecret = serverSecret;
exports.appId = appId;
exports.appSecret = appSecret;
