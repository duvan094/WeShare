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

  //TODO add email validation
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
  const id = parseInt(req.params.id);
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const email = req.body.email;

  db.get('Select * FROM Account WHERE id = ?',[id],function(error,account){
    if(error){
      res.status(500).end();
    }else if(!account){//no account found
      res.status(400).json(["accountNotFound"]);
    }else{
      //Check the old password compares to the hashed password in the database
      if(bcrypt.compareSync(oldPassword, account.hashedPassword)){

        let errorCodes = [];

        //TODO add email validation
        //invalidLettersInEmail
        /*if(!/^[a-zA-Z1-9]+$/.test(email)){
          errorCodes.push("invalidLettersInEmail");
        }*/

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
  const id = parseInt(req.params.id);

  const query = "DELETE FROM Account WHERE id = ?";
  const values = [id];

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

module.exports = router;
