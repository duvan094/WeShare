const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const vars = require('./variables');
const request = require('request'); //Used to do a request to google 
const uuidv1 = require('uuid/v1');//Used to generate unique universial id


const initDB = require('./initDB');


const serverSecret = vars.serverSecret;

router = express.Router();

const db = initDB.db;

const googleAuth =  {
  "client_id":"998656939869-kf3lus12g8qp63fvtpdj3j45sji8e30l.apps.googleusercontent.com",
  "project_id":"weshare-218810",
  "auth_uri":"https://accounts.google.com/o/oauth2/auth",
  "token_uri":"https://www.googleapis.com/oauth2/v3/token",
  "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
  "client_secret":"F1vtqUZD2b5n5-zRwJNpGoXd",
  "redirect_uris":["https://jacobduvander.se/got-response-from-google"]
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

/*
To do a post request:
localhost:3000/got-response-from-google?
code=4/cwAMTfldtfrVDX4frLbEVucrJK8bdaDPx7ZyghywVwJ9mtJWtIKZrtLayPFEV_aYBAWOan7634tC61TUuZ8uYsU&scope=https://www.googleapis.com/auth/plus.me&authuser=0&session_state=db06ded595fc75283578545b61f6598d78dff7a4..824d&prompt=consent
*/
router.post("/", function(req, res){
  const code = req.body.code;
  console.log(code);


  const formData = {
    client_id:     googleAuth.client_id,
    client_secret: googleAuth.client_secret,
    code: code,
    redirect_uri: googleAuth.redirect_uris[0],
    grant_type: "authorization_code"
 };




  //const codeUrl = "code=" + code + "&client_id=" + googleAuth.client_id + "&client_secret=" + googleAuth.client_secret + "&redirect_uri=" + googleAuth.redirect_uris[0] + "&grant_type=authorization_code";

  // TODO: Send post request to "https://www.googleapis.com/oauth2/v4/token"
  //With the codeUrl
  //e.g. code=4/cwAMTfldtfrVDX4frLbEVucrJK8bdaDPx7ZyghywVwJ9mtJWtIKZrtLayPFEV_aYBAWOan7634tC61TUuZ8uYsU&client_id=998656939869-kf3lus12g8qp63fvtpdj3j45sji8e30l.apps.googleusercontent.com&client_secret=F1vtqUZD2b5n5-zRwJNpGoXd&redirect_uri=https://jacobduvander.se/got-response-from-google&grant_type=authorization_code
  //Retrive sub from the tokenId that is received
  //Send back the sub to verify that it's a valid google user.
  //if(code !== ""){

  //console.log(formData);

 request.post(
  {
    url: 'https://www.googleapis.com/oauth2/v4/token',
    form: formData
  },
  function (err, httpResponse, body) {
    const id_token = JSON.parse(body).id_token;
    const payload = jwt.decode(id_token);

    const tokenSub = payload.sub;
    const email = payload.email;

    //Check if user has logged in with google before
    db.get("SELECT * FROM Account WHERE googleSub = ?",[tokenSub],function(error,account){
      if(error){
        res.status(500).send(error).end();
        return;
      }else if(!account){//no account found
        const id = uuidv1();//Generate unique id
        const query = "INSERT INTO Account (id,username,email,googleSub) VALUES (?,?,?,?)";
        const values = [id,email,email,tokenSub];
        db.run(query,values,function(error){//Create new account
          if(error){
            res.status(500).end();
          }else{//When the account has been successfully created, send back accessToken so that the user can be logged in
            const accessToken = jwt.sign({accountId: this.lastID}, serverSecret);
            const idToken = jwt.sign({sub:this.lastID, preferred_username:email}, serverSecret);
    
            res.status(201).json({
              access_token: accessToken,
              token_type: "Bearer",
              id_token: idToken
            });
    
          }
        });
      }else{//If the user has logged in with google before an accessToken is returned
        // Create a new token that can be sent to client
        const accessToken = jwt.sign({accountId: account.id}, serverSecret);
        const idToken = jwt.sign({sub:account.id, preferred_username:account.username}, serverSecret);

        res.status(200).json({
          access_token: accessToken,
          token_type: "Bearer",
          id_token: idToken
        });
      }
       
      
      return;
    });
  });

    res.send(tokenSub).status(200).end();
  }
);


});

module.exports = router;
