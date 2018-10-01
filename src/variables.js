const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = 10;//How many times the password is hashed
const serverSecret = "jacobjhaskjhdjakhdkahdjakasdoliver"; //

exports.express = express;
exports.bodyParser = bodyParser;
exports.bcrypt = bcrypt;
exports.jwt = jwt;
exports.saltRounds = saltRounds;
exports.serverSecret = serverSecret;
