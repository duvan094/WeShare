// require all npm packages and help files
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initDB = require('./initDB');
const vars = require('./variables');

const serverSecret = vars.serverSecret;
const db = initDB.db;

// Used to export the module, that will be then used in another file.js
const router = express.Router();

// Use bodyparser to be able to read bodies written in JSON and XML format
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

// Doing a POST request to create an account
router.post("/", function(req, res){

  const username = req.body.username;
  const password = req.body.password;

  const query = 'Select * FROM Account WHERE username = ?';
  const values = [username];

 //First check if user exists
  db.get(query,values,function(error,account){
    if(error){
      res.status(500).end();
    }else if(!account){//no account found? Returning error code invalid_client
      res.status(400).json(["invalid_client"]);
    }else{
      //Checks the entered password, compares it to the hashedpassword in the database.
      if(bcrypt.compareSync(password, account.hashedPassword)){

        // Create a new token that can be sent to client
        const accessToken = jwt.sign({accountId: account.id}, serverSecret);
        const idToken = jwt.sign({sub:account.id, preferred_username:account.username}, serverSecret);
        //Returning the accessToken for the user to use in the authorizationHeader
        res.status(200).json({
          access_token: accessToken,
          token_type: "Bearer",
          id_token: idToken
        });
      }else{
        //If password doesn't match the user is unauthorized
        res.status(401).json(["Unathorized"]);
      }
    }
  });
});

// A function to check if the user is authorized.
function authorizedUser(req,accountId = null){
  const authorizationHeader = req.get("authorization");

  //Stops the function if the authorization code is undefined
  if(authorizationHeader === undefined){
    return false;
  }
  //used to remove "Bearer" in the beginning of accessToken
  const accessToken = authorizationHeader.substr(7);

  let tokenAccountId = null;

  try{//Check if user is authorized
    const payload = jwt.verify(accessToken,serverSecret);
    tokenAccountId = payload.accountId;
  }catch(error){//if the payload fails it means it is tempered with
    return false;
  }

  if(accountId !== null){
    if(tokenAccountId !== accountId){//Check so accountId matches the one saved in the token
      return false;
    }else{
      return true;
    }
  }else{//Return the tokenAccountId for other validations
    return tokenAccountId;
  }

}

//Exports the modules
module.exports = router;
module.exports.authorizedUser = authorizedUser;
