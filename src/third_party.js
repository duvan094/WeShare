//require all npm packages and help files
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('request'); //Used to do a request to google
const uuidv1 = require('uuid/v1');  //Used to generate unique universial id
const vars = require('./variables');
const initDB = require('./initDB');

const serverSecret = vars.serverSecret;
const db = initDB.db;

router = express.Router();  //Router is used to export the module, that will then be used in another file.js

/*Use bodyparser to be able to read bodies written in JSON and XML format.*/
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

/*The google credentials*/
const googleAuth =  {
  "client_id":"998656939869-kf3lus12g8qp63fvtpdj3j45sji8e30l.apps.googleusercontent.com",
  "project_id":"weshare-218810",
  "auth_uri":"https://accounts.google.com/o/oauth2/auth",
  "token_uri":"https://www.googleapis.com/oauth2/v3/token",
  "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
  "client_secret":"F1vtqUZD2b5n5-zRwJNpGoXd",
  "redirect_uris":["https://jacobduvander.se/got-response-from-google"]
};

/*
Google login link
https://accounts.google.com/o/oauth2/v2/auth?client_id=998656939869-kf3lus12g8qp63fvtpdj3j45sji8e30l.apps.googleusercontent.com&redirect_uri=https://jacobduvander.se/got-response-from-google&response_type=code&scope=openid%20profile%20email

To do a post request:
localhost:3000/got-response-from-google?
code=4/cwAMTfldtfrVDX4frLbEVucrJK8bdaDPx7ZyghywVwJ9mtJWtIKZrtLayPFEV_aYBAWOan7634tC61TUuZ8uYsU&scope=https://www.googleapis.com/auth/plus.me&authuser=0&session_state=db06ded595fc75283578545b61f6598d78dff7a4..824d&prompt=consent
*/
router.post("/", function(req, res){
  const code = req.body.code;

  const formData = {
    client_id:     googleAuth.client_id,
    client_secret: googleAuth.client_secret,
    code: code,
    redirect_uri: googleAuth.redirect_uris[0],
    grant_type: "authorization_code"
 };

 /*Do a post request to Google to get the email and sub*/
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
      }else if(!account){//If no account matching the googleSub is found, one will be created.
        const id = uuidv1();//Generate unique id

        const query = "INSERT INTO Account (id,username,email,googleSub) VALUES (?,?,?,?)";
        const values = [id,email,email,tokenSub];

        db.run(query,values,function(error){//Create new account
          if(error){
            res.status(500).end();
          }else{//When the account has been successfully created, send back accessToken so that the user can be logged in
            const accessToken = jwt.sign({accountId: this.lastID}, serverSecret);
            const idToken = jwt.sign({sub:this.lastID, preferred_username:email}, serverSecret);

            //Send back the tokens
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
});


module.exports = router;
