//everything about GroupMembers should go here


//Add a group member
app.post("/group-members", function(req, res) {
	const body = req.body;
	const groupId = body.groupId;
	const userId = body.userId;

	const values = [groupId, userId]
	const query = "INSERT INTO groupMember(groupId,userId) VALUES (?,?,?)"
	//query2 is for checking if user is in group already!
	const values2 = [userId, groupId]
	const query2 = "SELECT * FROM GroupMember WHERE userId = ? AND groupId = ?"

	db.get(query2,values2, function(error, groupMember){
		if(error){
			res.status(500).end()
		} else if(groupMember) {
			res.status(409).send("An attempt was made to create an object that already exists")
		}
	} )

	db.run(query, values, function(error){
		if(error){

		} else {

		}
	})
});

//View all group members
app.get("/group-members/:id", function(req, res) {
	const id = parseInt(req.params.id);
	const query = "SELECT * FROM groupMember WHERE id= ?"
	const values = [id];

	db.get(query, values, function(error, post) {
		if (error) {
			res.status(500).send("Internal Error");
		} else {
			res.status(200).send(post);
		}
	});
});

//Delete a group-member
app.delete("/group-members/:id", function(req, res) {
	const id = parseInt(req.params.id);
	const query = "DELETE * FROM groupMember WHERE id = ?";
	const values = [id];

 	db.get('SELECT * FROM Account Where id = ?', [accountId], function(error, account) {
		if (error) {
			res.status(500).end()
		} else if (!account) {
			res.status(400).json({
				error: "acccountNotFound"
			});
		} else {
			db.run(query, values, function(error){
		      if(error) {
      			res.status(500).send("Internal error")
      		} else {
      			res.status(201).end();
      		}
	       });
		}
  }
});
