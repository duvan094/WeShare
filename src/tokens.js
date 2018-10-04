const express = require('express');
const bodyParser = require('body-parser');

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
        console.log("u logged in brotha");
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

module.exports = router;