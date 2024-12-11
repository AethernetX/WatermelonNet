//For security reasons, we will put the secrets in a .env file
var dotenv = require("dotenv");
dotenv.config();

//import
var express = require("express");
var ejs = require("ejs");
var mysql = require("mysql2");
var expressSanitizer = require("express-sanitizer");

const app = express();
const port = 8000;

app.set("view engine", "ejs");

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

//public folder
app.use(express.static(__dirname + '/public'));

// setup express sanitiser
app.use(expressSanitizer());

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'melon_app',
    password: process.env.DB_PASSWORD,
    database: 'melon_trade'
});
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database');
});
global.db = db

//route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

const usersRoutes = require("./routes/users");
app.use('/users', usersRoutes);

app.listen(port, () => console.log(`Node app listening on port ${port}!`));