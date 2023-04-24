const PORT = 3000;
const express = require("express");
const app = express();
const morgan = require("morgan");
const { client } = require("./db");

client.connect();

app.use(morgan("dev")); //this function logs out the incoming requests
app.use(express.json()); //function which reads incoming JSON from requests

const apiRouter = require("./api");

app.use("/api", apiRouter);
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
