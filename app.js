const express = require('express'); //require the npm package 'express'

const app = express();

app.use(require('./src/index'));

app.listen(3000); //Binds and listens for connections on the specified host and port
