require("dotenv").config();
const PORT = 3000;
const express = require("express");
const app = express();
const morgan = require("morgan");
const { client } = require("./db");
const cors = require("cors");
client.connect(); //connect our database to our server
app.use(cors());
app.use(morgan("dev")); //this function logs out the incoming requests
app.use(express.json()); //function which reads incoming JSON from requests

const apiRouter = require("./api");

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
