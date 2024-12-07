//For security reasons, we will put the secrets in a .env file
var dotenv = require("dotenv");
dotenv.config();

//import
var express = require("express");

var ejs = require("ejs");

var mysql = require("mysql2");

const app = express();
const port = 8000;

app.set("view engine", "ejs");

//public folder
app.use(express.static(__dirname + '/public'));

//route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

app.listen(port, () => console.log(`Node app listening on port ${port}!`));