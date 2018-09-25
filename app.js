const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database("my-database.db");

const app = express();

const saltRounds = 10;//How many times the password is hashed
const serverSecret = "jacobjhaskjhdjakhdkahdjakasdoliver"; //

// Tell the database to use foreign keys.
db.run("PRAGMA foreign_keys = ON");


db.run(`
  CREATE TABLE IF NOT EXISTS Account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hashedPassword TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS Groups (
    groupId INTEGER PRIMARY KEY AUTOINCREMENT,
    adminId INTEGER NOT NULL,
    groupName TEXT NOT NULL UNIQUE,
    platformName TEXT NOT NULL,
    paymentDate DATE,
    platformUsername TEXT NOT NULL,
    platformFee INT NOT NULL,
    FOREIGN KEY(adminId) REFERENCES Account(id)
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS GroupMember (
    groupId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES Account(id)
  )
`);
