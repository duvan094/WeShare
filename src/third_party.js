const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const vars = require('./variables');
const request = require('request');

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
    console.log(body);
    const id_token = JSON.parse(body).id_token;
    console.log("id_token: " + id_token);
    try{//Check if user is authorized
      const payload = jwt.verify(id_token,serverSecret);
      tokenSub = payload.sub;
    }catch(error){//if the payload fails it means it is tempered with
      res.status(401).end();
      return;
    }

    console.log(tokenSub);

    res.send(tokenSub).status(200).end();
  }
);


});

module.exports = router;
