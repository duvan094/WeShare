//everything about GroupMembers should go here
const express = require('express');
const bodyParser = require('body-parser');
const initDB = require('./initDB');
const token = require('./tokens');//import verify function
router = express.Router();

const db = initDB.db;


router.use(bodyParser.json());

//TODO: Add a group member ADMIN VALIDATION FOR ADDING PLS DO!
router.post("/", function(req, res){
	const body = req.body;
	const groupId = body.groupId;
	const accountId = body.accountId;

	const values = [groupId, accountId];
	const query = "INSERT INTO groupMember(groupId,accountId) VALUES (?,?)";

	//Check if the user trying to insert new group member is an admin
	db.get("SELECT adminId FROM 'Group' WHERE groupId = ?", [groupId], function(error, groupAdmin){
		if(error){
			res.status(500).send(error).end();
		}else{

			token.authorizedUser(req,groupAdmin.adminId);

			db.run(query, values, function(error){
				if(error){
					if(error.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: GroupMember.groupId, GroupMember.accountId"){
						res.status(409).send("userAlreadyExists").end();//Send error codes
						return;
					}else{
						res.status(500).send(error).end();
					}
				}else{
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

	//Save the tokenAccountId
	const tokenAccountId = token.authorizedUser(req);

	const values = [groupId];

	db.all(query, values, function(error, groupMembers){
		if (error){
			res.status(500).send("Internal Error");
		}else{
			//Check if one of the accountId's in the match the tokenAccountId
			for(let i = 0; i < groupMembers.length; i++){
				if(groupMembers[i].accountId == tokenAccountId){
					res.status(200).send(groupMembers);
				}
			}
			res.status(401).send("Unathorized");
		}
	});
});

//Delete a group-member
router.delete("/", function(req, res) {
	const groupId = parseInt(req.query.groupId);
	const accountId = parseInt(req.query.accountId);
	const query = "DELETE FROM GroupMember WHERE groupId = ? AND accountId = ?";
	const values = [groupId, accountId];

	//Check if the user deleting is the group admin
	db.get('SELECT adminId FROM Group Where id = ?', [groupId], function(error, adminAccount) {

		token.authorizedUser(req,adminAccount.adminId);

		//Check if GroupMember exists
		db.get('SELECT * FROM GroupMember Where groupId = ? AND accountId = ?', values, function(error, account) {
			if(error){
				res.status(500).end();
			}else if(!account){
				res.status(400).json(["accountNotFound"]);
			}else{
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
