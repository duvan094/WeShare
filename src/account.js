const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const initDB = require('./initDB');
const vars = require('./variables');

router = express.Router();

const db = initDB.db;
const saltRounds = vars.saltRounds;


router.use(bodyParser.json());

//Create new account
router.post("/", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  let errorCodes = [];

  if(username.length < 4){  // Validate it
    errorCodes.push("usernameTooShort");
  }else if(username.length > 20){
    errorCodes.push("usernameTooLong");
  }

  //validating for invalidCharacters
  if(!/^[a-zA-Z1-9]+$/.test(username)){
    errorCodes.push("usernameInvalidCharacters");
  }

  //invalidLettersInEmail
  /*if(!/^[a-zA-Z1-9]+$/.test(email)){
    errorCodes.push("invalidLettersInEmail");
  }*/

  if(errorCodes.length > 0){
    res.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  //Hash the password before inserting to database
  const hashedPassword = bcrypt.hashSync(password, saltRounds)

  const query = "INSERT INTO Account (username,hashedPassword,email) VALUES (?,?,?)";
  const values = [username,hashedPassword,email];

  db.run(query,values,function(error){
    if(error){
      //Check if the username or email fails because they are not unique
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.username"){
        res.status(400).json(["usernameNotUnique"]);
      }else if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.email"){
        res.status(400).json(["emailAlreadyExist"]);
      }else{
        res.status(500).end();
      }
    }else{
      res.setHeader("location","/accounts/"+this.lastID);
      res.status(201).end();
    }
  });
});

//Retrieve single account
//get id
router.get("/:id", function(req, res) {
	const id = parseInt(req.params.id);
	const query = "SELECT * FROM Account WHERE id= ?";
	db.get(query, [id], function(error, post) {
		if (error) {
			res.status(500).send("Internal Error");
		} else {
			res.status(200).send(post);
		}
	});
});

//PUT Update account
router.put("/:id", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  let errorCodes = [];

  if(username.length < 4){  // Validate it
    errorCodes.push("usernameTooShort");
  }else if(username.length > 20){
    errorCodes.push("usernameTooLong");
  }
  if(!/^[a-zA-Z1-9]+$/.test(username)){
    errorCodes.push("usernameInvalidCharacters");
  }

  if(errorCodes.length > 0){
    res.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  const query = "UPDATE Account SET username = ?, password = ?, email = ?";
  const values = [username,email];

  db.run(query,values,function(error){
    if(error){
      res.status(500).end();
    }else{
      res.status(201).end();
    }
  });
});

//Delete account

router.delete("/:id", function(req, res){
  const groupId = req.body.groupId;

  const query = "DELETE * FROM Groups WHERE groupId = ?";
  const values = [groupId];

  db.get("SELECT * FROM Groups WHERE groupId = ?",[groupId],function(error,group){
    if(error){

    }else if(!group){//no acount found
      response.status(400).send("groupNotFound").end();
      return;
    }else{
      db.run(query,values,function(error){
        if(error){
          response.status(500).end();
        }else{
          response.status(201).end();
        }
      });
    }
  });
});

module.exports = router;
