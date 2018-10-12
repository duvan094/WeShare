//everything about GroupMembers should go here
const express = require('express');
const bodyParser = require('body-parser');
const initDB = require('./initDB');
const token = require('./tokens');//import verify function
const router = express.Router();

const db = initDB.db;

// Use bodyparser to be able to read bodies written in JSON and XML format
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));


router.post("/", function(req, res){
	const body = req.body;
	const groupId = body.groupId;
	const accountId = body.accountId;

	const values = [groupId, accountId];
	const query = "INSERT INTO groupMember(groupId,accountId) VALUES (?,?)";

	//Check if the user trying to insert new groupmember is an admin
	db.get("SELECT adminId FROM 'Group' WHERE id = ?", [groupId], function(error, groupAdmin){
		if(error){
			res.status(500).send(error.message).end();
		}else{

		  //Check if user is admin of group and allowed to make changes
			if(!token.authorizedUser(req,groupAdmin.adminId)){
				res.status(401).end();
				return;
			}

			//Insert groupmember into databse
			db.run(query, values, function(error){
				if(error){
					if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: GroupMember.groupId, GroupMember.accountId"){
						res.status(400).send("userAlreadyExists").end();//Send error codes
						return;
					}else{
						res.status(500).send(error).end();
					}
				}else{//Groupmember was successfully added
					res.status(201).end();
				}
			});
		}
	});
});

//View all group members
router.get("/:groupId", function(req, res){
	const groupId = parseInt(req.params.groupId);
	const query = `
    SELECT Account.id, Account.username, Account.email
    FROM GroupMember
    Join Account ON Account.id = GroupMember.accountId
    WHERE GroupMember.groupId = ?;
  `;

	//Save the tokenAccountId for further verification
	const tokenAccountId = token.authorizedUser(req);

	if(!tokenAccountId){//Check if authorization failed
	res.status(401).end();
    return;
  }

	const values = [groupId];

	//Run the select query
	db.all(query, values, function(error, groupMembers){
		if (error){
			res.status(500).send("Internal Error");
		}else{
			/*
				Check if one of the accountId's of the groupMembers match the tokenAccountId
				to see if they are authorized to get information about the group.
			*/
			for(let i = 0; i < groupMembers.length; i++){
				if(groupMembers[i].id == tokenAccountId){
					res.status(200).send(groupMembers).end();
					return;
				}
			}
			res.status(401).send("Unathorized").end();
		}
	});
});

//Delete a group-member
router.delete("/?", function(req, res) {
	const groupId = parseInt(req.query.groupId);
	const accountId = req.query.accountId;

	const query = "DELETE FROM GroupMember WHERE groupId = ? AND accountId = ?";
	const values = [groupId, accountId];

	//Check if the user deleting is the group admin
	db.get('SELECT * FROM "Group" Where id = ?', [groupId], function(error, group) {

		//Check if user is admin of group and allowed to make changes
		if(!token.authorizedUser(req,group.adminId)){
			res.status(401).end();
			return;
		}

		//Check if GroupMember exists
		db.get('SELECT * FROM GroupMember Where groupId = ? AND accountId = ?', values, function(error, account) {
			if(error){
				res.status(500).end();
			}else if(!account){
				res.status(400).json(["accountNotFound"]);
			}else{
				//If the GroupMember exists, delete from group.
				db.run(query, values, function(error){
			    if(error){
	      	  res.status(500).send("Internal error");
	      	}else{
	    		  res.status(201).end();
	    		}
		    });
			}
	  });
	});
});

module.exports = router;
