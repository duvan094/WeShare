//everything about Group's should go here
const express = require('express');
const bodyParser = require('body-parser');
const initDB = require('./initDB');
const db = initDB.db;

router = express.Router();
router.use(bodyParser.json());

//Create new group
router.post("/", function(req, res){
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
    INSERT INTO 'Group' (adminId,groupName,platformName,platformUsername,platformFee,paymentDate,privateGroup)
    VALUES (?,?,?,?,?,?,?)
  `;

  const values = [adminId,groupName,platformName,platformUsername,platformFee,paymentDate,privateGroup];

  db.run(query,values,function(error){
    if(error){
      //If the groupName fails because it's not unique
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: 'Group'.groupName"){
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
router.get("/",function(req, res){
 const query = "SELECT * FROM 'Group' WHERE privateGroup = 0";

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
router.get("/:id", function(req, res){
 const id = parseInt(req.params.groupId);
 const query = "SELECT * FROM 'Group' WHERE groupId = ?";
 const values = [id];

 db.get(query, values, function(error, post){
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
router.put("/:id", function(req, res){
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

  const query = "UPDATE 'Group' SET groupName = ?, platformUsername = ?, platformFee = ?, paymentDate = ?, privateGroup = ? WHERE groupId = ?";
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
router.delete("/:id",function(req, res){
  const groupId = req.body.groupId;
  const values = [groupId];

  db.get("SELECT * FROM 'Group' WHERE groupId = ?",values,function(error,group){
    if(error){

    }else if(!group){//no acount found
      response.status(400).send("groupNotFound").end();
      return;
    }else{
      const query = "DELETE * FROM 'Group' WHERE groupId = ?";
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

module.exports = router;
