//everything about GroupMembers should go here
const express = require('express');
const bodyParser = require('body-parser');
const initDB = require('./initDB');

router = express.Router();

const db = initDB.db;


router.use(bodyParser.json());

//Add a group member
router.post("/", function(req, res){
	const body = req.body;
	const groupId = body.groupId;
	const userId = body.userId;

	const values = [userId, groupId];
	const query = "INSERT INTO groupMember(userId,groupId) VALUES (?,?)";

	//check if user is in the group already. if not add the group memeber.
	db.get("SELECT * FROM GroupMember WHERE userId = ? AND groupId = ?", values, function(error, groupMember){
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
router.get("/:id", function(req, res){
	const id = parseInt(req.params.id);
	const query = "SELECT * FROM groupMember WHERE id= ?";
	const values = [id];

	db.get(query, values, function(error, post){
		if (error){
			res.status(500).send("Internal Error");
		}else{
			res.status(200).send(post);
		}
	});
});

//Delete a group-member
router.delete("/:id", function(req, res) {
	const id = parseInt(req.params.id);
	const query = "DELETE * FROM groupMember WHERE id = ?";
	const values = [id];

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
