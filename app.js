const express = require('express');

const app = express();

app.use(require('./src/index'));

app.listen(3000);
