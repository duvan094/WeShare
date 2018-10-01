const sqlite3 = require('sqlite3');
const db = new sqlite3.Database("my-database.db");

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
  CREATE TABLE IF NOT EXISTS 'Group' (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    accountId INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES Account(id)
  )
`);

exports.db = db;