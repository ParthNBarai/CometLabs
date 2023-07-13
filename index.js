const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const ConnectionDB = require("./config/database");

app.use(express.json());
ConnectionDB();

app.use('/api/v1/user', require('./routes/User'))
app.use('/api/v1/problem', require('./routes/Questions'))
app.use('/api/v1/testcase', require('./routes/TestCase'))
app.use('/api/v1/submissions', require('./routes/Submissions'))

app.listen(port, () => console.log(`Server up and running...at ${port}`))

