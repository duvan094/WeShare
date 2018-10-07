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
    paymentDate DATE DEFAULT (DATE('now', '+1 month')),
    platformUsername TEXT NOT NULL,
    platformFee INT NOT NULL,
    privateGroup BOOLEAN,
    FOREIGN KEY(adminId) REFERENCES Account(id)
    ON DELETE CASCADE
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS GroupMember (
    groupId INTEGER NOT NULL,
    accountId INTEGER NOT NULL,
    PRIMARY KEY (groupId, accountId),
    FOREIGN KEY(accountId) REFERENCES Account(id)
    ON DELETE CASCADE,
    FOREIGN KEY(groupId) REFERENCES 'Group'(id)
    ON DELETE CASCADE
  )
`);

exports.db = db;
