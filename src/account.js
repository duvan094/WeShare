//everything about account should go here

//Create new account
app.post("/accounts", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  let errorCodes = [];

  if(username.length < 4){  // Validate it
    errorCodes.push("usernameTooShort");
  }else if(groupName.length > 20){
    errorCodes.push("usernameTooLong");
  }

  //validating for invalidCharacters
  if(!/^[a-zA-Z1-9]+$/.test(username)){
    errorCodes.push("usernameInvalidCharacters");
  }

  if(errorCodes.length > 0){
    response.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  //Hash the password before inserting to database
  const hashedPassword = bcrypt.hashSync(password, saltRounds)

  const query = "INSERT INTO Account (username,hashedPassword) VALUES (?,?)";
  const values = [username,hashedPassword];

  db.run(query,values,function(error){
    if(error){
      //If the username fails because it's not unique
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Account.username"){
        res.status(400).json(["usernameNotUnique"]);
      }else{
        res.status(500).end();
      }
    }else{
      res.setHeader("location","/groups/"+this.lastID);
      res.status(201).end();
    }
  });
});

//Retrieve single account
//get id
app.get("/accounts/:id", function(req, res) {
	const id = parseInt(req.params.id);
	const query = "SELECT * FROM Account WHERE id= ?";
	db.get(query, [id], function(error, post) {
		if (error) {
			res.status(500).send("Internal Error");
		} else {
			res.status(200).send(post);
		}
	});
});

//PUT Update account
app.put("/accounts/:id", function(req, res){

});
//Delete account
