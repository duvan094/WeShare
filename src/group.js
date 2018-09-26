//everything about Group's should go here

//Create new group
app.post("/groups", function(req, res){
  const body = req.body;
  const adminId = body.adminId;
  const groupName = body.groupName;
  const platformName = body.platformName;
  const platformUsername = body.platformUsername;
  const platformFee = body.platformFee;
  const paymentDate = body.paymentDate;
  const privateGroup = body.privateGroup;

  let errorCodes = [];

  if(groupName.length < 4){  // Validate it
    errorCodes.push("groupNameTooShort");
  }else if(groupName.length > 20){
    errorCodes.push("groupNameTooLong");
  }

  if(!/^[a-zA-Z1-9]+$/.test(groupName)){
    errorCodes.push("groupNameInvalidCharacters");
  }

  if(errorCodes.length > 0){
    response.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  const query = `
    INSERT INTO Groups (adminId,groupName,platformName,platformUsername,platformFee,paymentDate,privateGroup)
    VALUES (?,?,?,?,?,?,?)
  `;

  const values = [adminId,groupName,platformName,platformUsername,platformFee,paymentDate,privateGroup];

  db.run(query,values,function(error){
    if(error){
      //If the groupName fails because it's not unique
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Groups.groupName"){
        res.status(400).json(["groupNameNotUnique"]);
      }else{
        res.status(500).end();
      }
    }else{
      res.setHeader("location","/groups/"+this.lastID);
      res.status(201).end();
    }
  });
});



//Retrieve all Groups
app.get("/groups", function(req, res){
 const query = "SELECT * FROM Groups WHERE privateGroup = 0";

 db.get(query, function(error, post){
   if(error){
     res.status(500).send(error);
   }else{
     if(post){
       res.status(200).send(post);
     }else{
      res.status(404).end();
     }
   }
 });
});

//Retrieve single Group
app.get("/groups/:id", function(req, res){
 const id = parseInt(req.params.groupId);
 const query = "SELECT * FROM Groups WHERE groupId = ?";
 const values = [id];

 db.get(query,values, function(error, post){
   if(error){
     response.status(500).send(error);
   }else{
     if(post){
       response.status(200).send(post);
     }else{
      response.status(404).end();
     }
   }
 });
});

//Update Group
app.put("/groups/:id", function(req, res){
  const body = req.body;
  const groupId = body.groupId;
  const groupName = body.groupName;
  const platformUsername = body.platformUsername;
  const platformFee = body.platformFee;
  const paymentDate = body.paymentDate;
  const privateGroup = body.privateGroup;

  let errorCodes = [];

  if(groupName.length < 4){  // Validate it
    errorCodes.push("groupNameTooShort");
  }else if(groupName.length > 20){
    errorCodes.push("groupNameTooLong");
  }

  if(!/^[a-zA-Z1-9]+$/.test(groupName)){
    errorCodes.push("groupNameInvalidCharacters");
  }

  if(errorCodes.length > 0){
    response.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  const query = "UPDATE Groups SET groupName = ?, platformUsername = ?, platformFee = ?, paymentDate = ?, privateGroup = ? WHERE groupId = ?";
  const values = [groupName,platformUsername,platformFee,paymentDate,privateGroup,groupId];

  db.run(query,values,function(error){
    if(error){
      response.status(500).end();
    }else{
      response.status(201).end();
    }
  });
});

//Delete Groups
app.delete("/groups/:id", function(req, res){
  const groupId = req.body.groupId;

  const query = "DELETE * FROM Groups WHERE groupId = ?";
  const values = [groupId];

  db.run("SELECT * FROM Groups WHERE groupId = ?",[groupId],function(error,group){
    if(error){

    }else if(!group){//no acount found
      response.status(400).send("groupNotFound").end();
      return;
    }else{
      db.run(query,values,function(error){
        if(error){
          response.status(500).end();
        }else{
          response.status(201).end();
        }
      });
    }
  });
});
