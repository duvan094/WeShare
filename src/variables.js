const saltRounds = 10;//How many times the password is hashed
const serverSecret = "jacobjhaskjhdjakhdkahdjakasdoliver"; //Create our own serverSecret that is used for JWT sign/verify (random values)

// export our variables 
exports.saltRounds = saltRounds;
exports.serverSecret = serverSecret;
