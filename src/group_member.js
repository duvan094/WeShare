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
	token.authorizedUser(req,id);

	//check if user is in the group already. if not add the group memeber.
	db.get("SELECT * FROM GroupMember WHERE groupId = ? AND accountId = ?", values, function(error, groupMember){
		if(error){
			res.status(500).end();
			return;
		} else if(groupMember) {
				res.status(409).send("Conflict");
			return;
		} else {
				db.run(query, values, function(error){
				if(error){
					res.status(500).end();
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
 	token.authorizedUser(req,id);
	const values = [groupId];

	db.all(query, values, function(error, posts){
		if (error){
			res.status(500).send("Internal Error");
		}else{
			res.status(200).send(posts);
		}
	});
});

//Delete a group-member
router.delete("/", function(req, res) {
	const groupId = parseInt(req.query.groupId);
	const accountId = parseInt(req.query.accountId);
	const query = "DELETE FROM groupMember WHERE groupId = ? AND accountId = ?";
	const values = [groupId, accountId];
	token.authorizedUser(req,id);
 	db.get('SELECT * FROM Account Where id = ?', [accountId], function(error, account) {
		if(error){
			res.status(500).end();
		}else if(!account){
			res.status(400).json({
				error: "acccountNotFound"
			});
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

module.exports = router;
