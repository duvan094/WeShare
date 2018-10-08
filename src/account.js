const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const initDB = require('./initDB');
const vars = require('./variables');
const token = require('./tokens');//import verify function
const uuidv1 = require('uuid/v1');//Used to generate unique universial id

router = express.Router();

const db = initDB.db;
const saltRounds = vars.saltRounds;


router.use(bodyParser.json());

//Create new account
router.post("/", function(req, res){
  const id = uuidv1();//Generate unique id
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

  if(!validateEmail(email)){
    errorCodes.push("invalidEmail");
  }

  if(errorCodes.length > 0){
    res.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  //Hash the password before inserting to database
  const hashedPassword = bcrypt.hashSync(password, saltRounds)

  const query = `INSERT INTO Account (id,username,hashedPassword,email) VALUES (?,?,?,?)`;
  const values = [id,username,hashedPassword,email];

  db.run(query,values,function(error){
    if(error){
      //Check if the username or email fails because they are not unique
      errorCodes = [];

      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.username"){
        errorCodes.push("usernameNotUnique");
      }
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.email"){
        errorCodes.push("emailAlreadyExist");
      }

      if(errorCodes.length > 0){
        res.status(400).json(errorCodes).end();//Send error codes
        return;
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
router.get("/:username", function(req, res) {
  const username = req.params.username;

	const query = "SELECT id, username, email FROM Account WHERE username = ?";

  //Check if authorized user
  if(!token.authorizedUser(req)){
    res.status(401).end();
    return;
  }


	db.get(query, [username], function(error, post) {
		if (error) {
			res.status(500).json(["Internal Error"]).end();
		}else if(!post){
      res.status(400).json(["accountNotFound"]).end();
    } else {
			res.status(200).send(post).end();
		}
	});
});

//PUT Update account
router.put("/:id", function(req, res){
  const id = req.params.id;
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const email = req.body.email;

  //Check if authorized user
  if(!token.authorizedUser(req,id)){
    res.status(401).end();
    return;
  }



  db.get('Select * FROM Account WHERE id = ?',[id],function(error,account){
    if(error){
      res.status(500).end();
    }else if(!account){//no account found
      res.status(400).json(["accountNotFound"]);
    }else{
      //Check the old password compares to the hashed password in the database
      if(bcrypt.compareSync(oldPassword, account.hashedPassword)){

        let errorCodes = [];

        if(!validateEmail(email)){
          errorCodes.push("invalidEmail");
        }

        if(errorCodes.length > 0){
          res.status(400).json(errorCodes).end();//Send error codes
          return;
        }

        const hashedPassword = bcrypt.hashSync(newPassword, saltRounds)

        const query = "UPDATE Account SET hashedPassword = ?, email = ? WHERE id = ?";
        const values = [hashedPassword,email,id];

        db.run(query,values,function(error){
          if(error){
            res.status(500).end();
          }else{
            res.status(200).end();
          }
        });
      }else{
        res.status(401).end();
      }
    }
  });
});

//Delete account
router.delete("/:id", function(req, res){
  const id = req.params.id;

  const query = "DELETE FROM Account WHERE id = ?";
  const values = [id];

  //Check if user is authorized
  if(!token.authorizedUser(req,id)){
    res.status(401).end();
    return;
  }


  db.get("SELECT * FROM Account WHERE id = ?",values,function(error,account){
    if(error){
      res.status(500).send(error).end();
    }else if(!account){//no account found
      res.status(404).send("accountNotFound").end();
      return;
    }else{
      db.run(query,values,function(error){
        if(error){
          res.status(500).end();
        }else{
          res.status(204).end();
        }
      });
    }
  });
});

//Email validation from: http://form.guide/best-practices/validate-email-address-using-javascript.html
function validateEmail(email){
  var regex = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return regex.test(email);
}

module.exports = router;
