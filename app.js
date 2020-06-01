var express = require("express");
var port = process.env.PORT || 8080;
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");

var app = express();
var server = require('http').Server(app);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
routes(app);

server.listen(process.env.PORT || 5000);
