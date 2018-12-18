require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const server = express();

server.use(express.json());
server.use(cors());
server.use(morgan("dev"));
server.use(helmet());

//============================================================================== Server Check <-----
server.get("/", (req, res) => {
  res.json({ api: "running" });
});

//============================================================================== Server Initialization <----
const port = process.env.PORT || 9000;

server.listen(port, () => console.log(`\n=== Running on port ${port} ===\n`));
