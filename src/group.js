//everything about Group's should go here
const express = require('express');
const bodyParser = require('body-parser');
const initDB = require('./initDB');
const db = initDB.db;
const token = require('./tokens');//import verify function

const router = express.Router();
/*Bodyparser is used to be able to read bodies written in JSON format.*/
router.use(bodyParser.json());

//Create new group
router.post("/", function(req, res){
  const body = req.body;
  const groupName = body.groupName;
  const platformName = body.platformName;
  const platformUsername = body.platformUsername;
  const platformFee = body.platformFee;
  const privateGroup = body.privateGroup;

  let errorCodes = [];

  //Get the accountId from the logged in user
  const adminId = token.authorizedUser(req);

  if(adminId == false){
    res.status(401).end();
    return;
  }

  if(groupName.length < 4){  // Validate it
    errorCodes.push("groupNameTooShort");
  }else if(groupName.length > 20){
    errorCodes.push("groupNameTooLong");
  }

  //groupname validation
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
      if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Group.groupName"){
        res.status(400).json(["groupNameNotUnique"]);
      }else{
        console.log(error.message);
        res.status(500).send(error).end();
      }
    }else{

      const lastID = this.lastID;

      const values = [lastID, adminId];
      const query = "INSERT INTO groupMember(groupId,accountId) VALUES (?,?)";
      // Insert the admin as groupmember if group was created
      db.run(query, values, function(error){
        if(error){
          res.status(500).end();
        }else{
          res.setHeader("location","/groups/"+lastID);
          res.status(201).end();
        }
      });
    }
  });
});



//Retrieve all Groups
router.get("/",function(req, res){
  // selects all groups and counts the groupmembers
  const query = `
    SELECT 'Group'.id, 'Group'.adminId, 'Group'.groupName, 'Group'.platformName,
    'Group'.platformFee, 'Group'.paymentDate, Count(GroupMember.accountId) AS memberCount
    FROM 'Group'
    Join GroupMember ON 'Group'.id = GroupMember.groupId
    WHERE 'Group'.privateGroup = 0
    GROUP BY 'Group'.id, GroupMember.groupId
  `;

  //See if user is logged in
  if(!token.authorizedUser(req)){
    res.status(401).end();
    return;
  }

  db.all(query, function(error, posts){
    if(error){
      res.status(500).send(error);
    }else{
      if(posts.length !== 0){
        res.status(200).send(posts);
      }else{
        res.status(404).end();
      }
    }
  });
});

//Retrieve single Group
router.get("/:groupName", function(req, res){
  const groupName = req.params.groupName;
   // selects one group and counts the groupmembers
  const query = `
    SELECT 'Group'.id, 'Group'.adminId, 'Group'.groupName, 'Group'.platformName,
    'Group'.platformFee, 'Group'.paymentDate, Count(GroupMember.accountId) AS memberCount,
    'Group'.privateGroup
    FROM 'GroupMember'
    Join 'Group' ON 'Group'.id = GroupMember.groupId
    WHERE 'Group'.groupName = ?;
  `;

  const values = [groupName];
  //Check if user is logged in
  if(!token.authorizedUser(req)){
    res.status(401).end();
    return;
  }
// run the select query
 db.get(query, values, function(error, post){
   if(error){
     res.status(500).send(error.message);
   }else{
     if(post.id !== null){
       res.status(200).send(post);
     }else{
      res.status(404).send("groupNotFound").end();
     }
   }
 });
});

//Update Group
router.put("/:id", function(req, res){
  const id = parseInt(req.params.id); //Retrieve the id from the url
  const body = req.body;
  const groupName = body.groupName;
  const platformUsername = body.platformUsername;
  const platformFee = body.platformFee;
  const privateGroup = body.privateGroup;

  db.get("SELECT * FROM 'Group' WHERE id = ?",[id],function(error,group){
    if(error){
      res.status(500).send(error).end();
    }else if(!group){//no group found
      res.status(400).send("groupNotFound").end();
      return;
    }else{
      //Check if user is admin of group and allowed to make changes
      if(!token.authorizedUser(req,group.adminId)){
        res.status(401).end();
        return;
      }


      let errorCodes = []; //array error codes will get pushed into

      if(groupName.length < 4){  // Validate it
        errorCodes.push("groupNameTooShort");
      }else if(groupName.length > 20){
        errorCodes.push("groupNameTooLong");
      }
      // validation for invalid letters
      if(!/^[a-zA-Z1-9 ]+$/.test(groupName)){
        errorCodes.push("groupNameInvalidCharacters");
      }

      if(errorCodes.length > 0){
        res.status(400).json(errorCodes).end();//Send error codes
        return;
      }

      const query = "UPDATE 'Group' SET groupName = ?, platformUsername = ?, platformFee = ?, privateGroup = ? WHERE id = ?";
      const values = [groupName,platformUsername,platformFee,privateGroup,id];
      // run the update query
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
  const id = parseInt(req.params.id); //Retrieve the id from the url
  const values = [id];

  //check if group exists
  db.get("SELECT * FROM 'Group' WHERE id = ?",values,function(error,group){
    if(error){
      res.status(500).send(error).end();
    }else if(!group){//no group found
      res.status(400).send("groupNotFound").end();
      return;
    }else{
      //Check if user is admin of group and allowed to make changes
      if(!token.authorizedUser(req,group.adminId)){
        res.status(401).end();
        return;
      }

      const query = "DELETE FROM 'Group' WHERE id = ?";
      // run the delete query
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

module.exports = router; //Exports the module
