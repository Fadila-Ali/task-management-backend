const express = require("express");
const pgp = require('pg-promise')();
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

//! CONTROLLERS
const users = require("./controllers/usersController");


//! CONFIGURATION
const app = express();
const PORT = process.env.PORT || 8080;
const pgHost = process.env.PG_HOST;
const pgPort = process.env.PG_PORT;
const pgDatabase = process.env.PG_DATABASE;
const pgUser = process.env.PG_USER;
const pgPassword = process.env.PG_PASSWORD;

//! DATABASE CONNECTION
const db = pgp(`postgres://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`);

//! MIDDLEWARE
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000'] }));
app.use(morgan("tiny"));

db.connect()
  .then(obj => {
    console.log('Connected to the database');
    obj.done();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });


// users routes
app.use("/users", users);


// Welcome route
app.get("/", (req, res) => {
    res.send("Welcome to the Task-Maven, your tasks and time management app!");
  });
  
  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  // Handle 404
  app.get("*", (req, res) => {
    res.status(404).send("Page not found");
  });
  
  module.exports = app;