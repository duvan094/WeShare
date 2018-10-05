const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const initDB = require('./initDB');
const vars = require('./variables');

router = express.Router();

const serverSecret = vars.serverSecret;
const db = initDB.db;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));


router.post("/", function(req, res){

  const username = req.body.username;
  const password = req.body.password;

  //First check if user exists
  const query = 'Select * FROM Account WHERE username = ?';
  const values = [username];

  db.get(query,values,function(error,account){
    if(error){
      res.status(500).end();
    }else if(!account){//no acount found
      res.status(400).json(["invalid_client"]);
    }else{
      //Check entered password compares to the hashed password in the database
      if(bcrypt.compareSync(password, account.hashedPassword)){

        // Create a new token that can be sent to client
        const accessToken = jwt.sign({accountId: account.id}, serverSecret);
        const idToken = jwt.sign({sub:account.id, preferred_username:account.username}, serverSecret);

        res.status(200).json({
          access_token: accessToken,
          token_type: "Bearer",
          id_token: idToken
        });
      }else{
        res.status(400).json({error: "invalid_client"});
      }
    }
  });
});

function authorizedUser(req,accountId = null){
  const authorizationHeader = req.get("authorization");
  const accessToken = authorizationHeader.substr(7);//used to remove "Bearer" in the beginning of accessToken

  let tokenAccountId = null;

  try{//Check if user is authorized
    const payload = jwt.verify(accessToken,serverSecret);
    tokenAccountId = payload.accountId;
  }catch(error){//if the payload fails it means it is tempered with
    response.status(401).end();//Unathorized
    return;
  }

  if(accountId !== null){
    if(tokenAccountId != accountId){//Check so accountId matches the one saved in the token
      response.status(401).end();
      return;
    }
  }

}




function authorizedAdmin(){
  //TODO admin validation
}

module.exports = router;
module.exports.authorizedUser = authorizedUser;
module.exports.authorizedUser = authorizedAdmin;
