const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const ConnectionDB = require("./config/database");

app.use(express.json());
ConnectionDB();


app.listen(port, () => console.log(`Server up and running...at ${port}`))

