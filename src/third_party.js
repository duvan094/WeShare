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


const googleAuth =  {
  "client_id":"998656939869-kf3lus12g8qp63fvtpdj3j45sji8e30l.apps.googleusercontent.com",
  "project_id":"weshare-218810",
  "auth_uri":"https://accounts.google.com/o/oauth2/auth",
  "token_uri":"https://www.googleapis.com/oauth2/v3/token",
  "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
  "client_secret":"F1vtqUZD2b5n5-zRwJNpGoXd",
  "redirect_uris":["https://jacobduvander.se/got-response-from-google"]
};


router.post("/", function(req, res){
  console.log("hej");

  const code = req.params.code;

  console.log("hej");
  console.log(code);


  res.status(200).end();
  /*
  https://www.googleapis.com/oauth2/v4/token
  code=4/cwAMTfldtfrVDX4frLbEVucrJK8bdaDPx7ZyghywVwJ9mtJWtIKZrtLayPFEV_aYBAWOan7634tC61TUuZ8uYsU&client_id=998656939869-kf3lus12g8qp63fvtpdj3j45sji8e30l.apps.googleusercontent.com&client_secret=F1vtqUZD2b5n5-zRwJNpGoXd&redirect_uri=https://jacobduvander.se/got-response-from-google&grant_type=authorization_code
  */

  let codeUrl = "code=" + code + "&client_id=" + googleAuth.client_id + "&client_secret" + googleAuth.client_secret + "&redirect_uri" + googleAuth.redirect_uris[0] + "&grant_type=authorization_code";

});


module.exports = router;
