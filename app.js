var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");
process.env.TZ = 'Australia/Melbourne';

var app = express();
var server = require('http').Server(app);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
routes(app);

server.listen(process.env.PORT || 5000);

const io = require("socket.io")(server);
var users = [];
var profiles = [];

io.on('connection', (socket) => {
  socket.on('new_connection', (data) => {

    console.log("Connected new user : " + data.userId);
    console.log("Users connected : " + users.length);

    if (!users.includes(data.userId)) {
      users.push(data.userId);
      profiles.push(data);
    }

    io.sockets.emit('new_connection', {
      'online' : profiles
    });
  });

  socket.on('removeSocket', (data) => {
    console.log("Disconnected user : " + data.userId);

    var index = users.indexOf(data.userId);
    if (index > -1) {
      users.splice(index, 1);
    }
    newProfiles = []
    for (var i = 0; i < profiles.length; i++) {
      if (profiles[i].userId != data.userId){
        newProfiles.push(profiles[i])
      }
    }
    profiles = newProfiles;

    console.log("Users connected : " + users.length);
    io.sockets.emit('new_connection', {
      'online' : profiles
    });

  });
});
