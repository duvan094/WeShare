const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database("my-database.db");

const saltRounds = 10;//How many times the password is hashed
const serverSecret = "jacobjhaskjhdjakhdkahdjakasdoliver"; //

exports.express = express;
exports.bodyParser = bodyParser;
exports.sqlite3 = sqlite3;
exports.bcrypt = bcrypt;
exports.jwt = jwt;
exports.db = db;
exports.saltRounds = saltRounds;
exports.serverSecret = serverSecret;
