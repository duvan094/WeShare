const jwt = require('jsonwebtoken');

const saltRounds = 10;//How many times the password is hashed
const serverSecret = "jacobjhaskjhdjakhdkahdjakasdoliver"; //


exports.jwt = jwt;

exports.saltRounds = saltRounds;
exports.serverSecret = serverSecret;

