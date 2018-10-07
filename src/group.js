//everything about Group's should go here
const express = require('express');
const bodyParser = require('body-parser');
const initDB = require('./initDB');
const db = initDB.db;
const token = require('./tokens');//import verify function

router = express.Router();
router.use(bodyParser.json());

//Create new group
router.post("/", function(req, res){
  const body = req.body;
  //const adminId = body.adminId;
  const groupName = body.groupName;
  const platformName = body.platformName;
  const platformUsername = body.platformUsername;
  const platformFee = body.platformFee;
  const privateGroup = body.privateGroup;

  let errorCodes = [];

  //Get the accountId from the logged in user
  const adminId = token.authorizedUser(req);
  console.log(adminId);
/*
  if(!token.authorizedUser(req,adminId)){
    res.status(401).end();//Unathorized
    return;
  }
  */
  if(groupName.length < 4){  // Validate it
    errorCodes.push("groupNameTooShort");
  }else if(groupName.length > 20){
    errorCodes.push("groupNameTooLong");
  }

  if(!/^[a-zA-Z1-9 ]+$/.test(groupName)){
    errorCodes.push("groupNameInvalidCharacters");
  }

  if(errorCodes.length > 0){
    res.status(400).json(errorCodes).end();//Send error codes
    return;
  }

  const query = `
    INSERT INTO 'Group' (adminId,groupName,platformName,platformUsername,platformFee,privateGroup)
    VALUES (?,?,?,?,?,?)
  `;

  const values = [adminId,groupName,platformName,platformUsername,platformFee,privateGroup];

  db.run(query,values,function(error){
    if(error){
      //If the groupName fails because it's not unique
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: 'Group'.groupName"){
        res.status(400).json(["groupNameNotUnique"]);
      }else{
        res.status(500).send(error).end();
      }
    }else{

      const lastID = this.lastID;

      const values = [lastID, adminId];
    	const query = "INSERT INTO groupMember(groupId,accountId) VALUES (?,?)";
      db.run(query, values, function(error){
        if(error){
          res.status(500).end();
        }else{
          console.log("headerHej");
          res.setHeader("location","/groups/"+lastID);
          res.status(201).end();
        }
      });
    }
  });
});



//Retrieve all Groups
router.get("/",function(req, res){
  const query = `
    SELECT 'Group'.id, 'Group'.adminId, 'Group'.groupName, 'Group'.platformName,
    'Group'.platformFee, 'Group'.paymentDate, Count(GroupMember.accountId) AS memberCount
    FROM 'GroupMember'
    Join 'Group' ON 'Group'.id = GroupMember.groupId
    WHERE 'Group'.privateGroup = 0;
  `;

  //See if user is logged in
  token.authorizedUser(req);

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
  const id = parseInt(req.params.id);

  const query = `
    SELECT 'Group'.id, 'Group'.adminId, 'Group'.groupName, 'Group'.platformName,
    'Group'.platformFee, 'Group'.paymentDate, Count(GroupMember.accountId) AS memberCount
    FROM 'GroupMember'
    Join 'Group' ON 'Group'.id = GroupMember.groupId
    WHERE 'GroupMember'.groupId = ?;
  `;

  const values = [id];
  //Check if user is logged in
  token.authorizedUser(req);

 db.get(query, values, function(error, post){
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

//Update Group
router.put("/:id", function(req, res){
  const id = parseInt(req.params.id);
  const body = req.body;
  const groupName = body.groupName;
  const platformUsername = body.platformUsername;
  const platformFee = body.platformFee;
  const privateGroup = body.privateGroup;

  db.get("SELECT * FROM 'Group' WHERE id = ?",[id],function(error,group){
    if(error){
      res.status(500).send(error).end();
    }else if(!group){//no acount found
      res.status(400).send("groupNotFound").end();
      return;
    }else{
      //Check if user is admin of group and allowed to make changes
      token.authorizedUser(req,group.adminId);

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
        res.status(400).json(errorCodes).end();//Send error codes
        return;
      }

      const query = "UPDATE 'Group' SET groupName = ?, platformUsername = ?, platformFee = ?, privateGroup = ? WHERE id = ?";
      const values = [groupName,platformUsername,platformFee,privateGroup,id];

      db.run(query,values,function(error){
        if(error){
          res.status(500).end();
        }else{
          res.status(201).end();
        }
      });
    }
  });
});

//Delete Groups
router.delete("/:id",function(req, res){
  const id = parseInt(req.params.id);
  const values = [id];

  db.get("SELECT * FROM 'Group' WHERE id = ?",values,function(error,group){
    if(error){
      res.status(500).send(error).end();
    }else if(!group){//no acount found
      res.status(400).send("groupNotFound").end();
      return;
    }else{
      //Check if user is admin of group and allowed to make changes
      token.authorizedUser(req,group.adminId);

      const query = "DELETE FROM 'Group' WHERE id = ?";
      db.run(query,values,function(error){
        if(error){
          res.status(500).end();
        }else{
          res.status(204).end();
        }
      });
    }
  });
});

module.exports = router;
