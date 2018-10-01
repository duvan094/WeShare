//require('./src/init');
//require('./src/account');
//require('./src/group');
//require('./src/group_member');
const express = require('express');

const app = express();


app.use(require('./src'));

app.listen(3000);
