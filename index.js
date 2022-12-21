const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const routes = require("./api/routes/routes");

var cors = require("cors");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
mongoose.set("strictQuery", true);
mongoose

  .connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true })

  .then(console.log("CONNECTED"))

  .catch((err) => {
    console.log("xxxxxxxxxxxxxxxxxx");

    console.log(err);
  });

app.use(routes);
app.listen(3000);
