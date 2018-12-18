require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const knex = require("knex");
const KnexSessionStore = require("connect-session-knex")(session);

const knexConfig = require("./knexfile.js");
const db = knex(knexConfig.development);
const server = express();

server.use(express.json());
server.use(cors());
server.use(morgan("dev"));
server.use(helmet());

const sessionConfig = {
  name: "user login",
  secret: process.env.SECRET,
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false
  },
  httpOnly: true,
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    tablename: "sessions",
    sidfieldname: "sid",
    knex: db,
    createtable: true,
    clearInterval: 1000 * 60 * 60
  })
};
server.use(session(sessionConfig));

//============================================================================== Server Check <-----
server.get("/", (req, res) => {
  res.json({ api: "running" });
});
//============================================================================== Register User <-----
server.post("/register", (req, res) => {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;
  console.log(creds);
  db("users")
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => res.status(500).json(err));
});
//============================================================================== Login User <---------
server.post("/login", (req, res) => {
  const creds = req.body;
  console.log(creds);
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        req.session.userId = user.id;
        res.status(200).json({ message: "Authentication succesful" });
      } else {
        res.status(401).json({ message: "Failed to authenticate" });
      }
    })
    .catch(err => res.status(500).json(err));
});
//============================================================================== Get Users <---------
server.get("/users", (req, res) => {
  if (req.session && req.session.userId) {
    db("users")
      .select("id", "username")
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  } else {
    res.status(401).json({ message: "Please Login" });
  }
});

//============================================================================== Server Initialization <----
const port = process.env.PORT || 9000;

server.listen(port, () => console.log(`\n=== Running on port ${port} ===\n`));
