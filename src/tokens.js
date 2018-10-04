//everything about login here

//Used to login

app.post("/", function(request, response){

  const username = request.body.username;
  const password = request.body.password;

  //First check if user exists
  const query = 'Select * FROM Account WHERE username = ?';
  const values = [username];

  db.get(query,values,function(error,account){
    if(error){
      response.status(500).end();
    }else if(!account){//no acount found
      response.status(400).json(["invalid_client"]);
    }else{
      //Check entered password compares to the hashed password in the database
      if(bcrypt.compareSync(password, account.hashedPassword)){

        // Create a new token that can be sent to client
        const accessToken = jwt.sign({accountId: account.id}, serverSecret);
        const idToken = jwt.sign({sub:account.id, preferred_username:account.username}, serverSecret);

        response.status(200).json({
          access_token: accessToken,
          token_type: "Bearer",
          id_token: idToken
        });
      }else{
        response.status(400).json({error: "invalid_client"});
      }
    }
  });
});
