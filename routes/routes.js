var logic = require('../code');
var utils = require('../utils');
var fs = require('fs');
var multer = require('multer');
var upload = multer({
  dest: "./uploads"
});

var appRouter = function(app) {

  //Endpoint to index
  app.get('/', function(req, res) {
    result = JSON.stringify({
      message: "Server ready."
    });
    res.status(200).send(result);
  });

  //Endpoint to get user by id
  app.post('/userById', function(req, res) {
    return new Promise(function(resolve, reject) {
      logic.getUserById(req.body.userId).then(function(user) {
        resolve(res.status(200).send(user));
      });
    });
  });

  //Endpoint to save user profile data
  app.post('/user', upload.single('profilePicture'), function(req, res) {
    console.log("Request received at user data");
    var img = fs.readFileSync(req.file.path);
    req.body.profilePicture = img.toString('base64');

    return new Promise(function(resolve, reject) {
      logic.saveUserData(req.body).then(function(obj) {
        if (obj == -1) {
          resolve(res.status(401).send("An account under this email already exists."));
        } else {
          resolve(res.status(200).send(obj));
        }
      });
    });
  });

  //Endpoint to login
  app.post('/login', function(req, res) {
    console.log("Request received at user login");
    return new Promise(function(resolve, reject) {
      logic.loginUser(req.body).then(function(obj) {
        if (obj == -1) {
          resolve(res.status(401).send("Invalid email address. Please try again."));
        } else if (obj == -2) {
          resolve(res.status(401).send("Invalid password. Please try again."));
        } else {
          var result = {
            "userId": obj._id.toString(),
            "name": obj.name,
            "email": obj.email,
            "profilePicture": obj.profilePicture,
            "gender": obj.gender,
            "structure": obj.structure,
            "socialPresence": obj.socialPresence,
            "firstVisit": obj.firstVisit,
            "order": obj.order,
            "completedComments": obj.completedComments,
            "completedVotes": obj.completedVotes
          };
          resolve(res.status(200).send(result));
        }
      });
    });
  });

  //Endpoint to get users per group
  app.post('/usergroup', function(req, res) {
    console.log("Request received at get user group");
    return new Promise(function(resolve, reject) {
      logic.getGroupUsers(req.body).then(function(group) {
        res.status(200).send(group);
      });
    });
  });

  //Endpoint to get votes per question
  app.post('/displayVotes', function(req, res) {
    console.log("Request received at displayVotes");
    return new Promise(function(resolve, reject) {
      logic.getVotesForQuestion(req.body).then(function(obj) {
        res.status(200).send(obj);
      });
    });
  });

  //Endpoint to update user status
  app.post('/updateuser', function(req, res) {
    console.log("Request received at update user");
    return new Promise(function(resolve, reject) {
      logic.updateUser(req.body).then(function(userId) {
        res.status(200).send(userId);
      });
    });
  });

  //Endpoint to save an answer
  app.post('/userAnswer', function(req, res) {
    console.log("Request received at userAnswer endpoint");
    return new Promise(function(resolve, reject) {
      //save as user's answer and as a comment
      logic.saveAnswer(req.body).then(function(allComments) {
        //Retrieve all comments on this question and return
        result = JSON.stringify(allComments);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to save a reply
  app.post('/saveReply', function(req, res) {
    console.log("Request received at saveReply endpoint");
    return new Promise(function(resolve, reject) {
      logic.saveComment(req.body).then(function(allComments) {
        //Retrieve all comments on this question and return
        result = JSON.stringify(allComments);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to update vote count for a given comment
  app.post('/updateVoteForComment', function(req, res) {
    console.log("Request received at updateVoteForComment endpoint");
    return new Promise(function(resolve, reject) {
      logic.updateVoteForComment(req.body).then(function(allComments) {
        //Retrieve all comments on this question and return
        result = JSON.stringify(allComments);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to get all the questions and answers
  app.post('/questions', function(req, res) {
    console.log("Request received at all questions");
    return new Promise(function(resolve, reject) {
      logic.getAllQuestions(req.body).then(function(questions) {
        //Retrieve all comments on this question and return
        result = JSON.stringify(questions);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to get all the questions and votes
  app.post('/questionsAtVote', function(req, res) {
    console.log("Request received at questionsAtVote");
    return new Promise(function(resolve, reject) {
      logic.getAllQuestionsToVote(req.body).then(function(questions) {
        result = JSON.stringify(questions);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to get all questions answered by a given user
  app.post('/questionsPerUser', function(req, res) {
    console.log("Request received at all questionsPerUser");
    return new Promise(function(resolve, reject) {
      logic.getAnswersByUser(req.body).then(function(questions) {
        result = JSON.stringify(questions);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to get all topics voted by a auser
  app.post('/votesPerUser', function(req, res) {
    console.log("Request received at votesPerUser");
    return new Promise(function(resolve, reject) {
      logic.getVotesByUser(req.body).then(function(questionsVoted) {
        result = JSON.stringify(questionsVoted);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to get all comments for the question
  app.post('/userComments', function(req, res) {
    console.log("Request received at get user comments for question");
    return new Promise(function(resolve, reject) {
      logic.getCommentsForQuestion(req.body).then(function(group) {
        res.status(200).send(group);
      });
    });
  });


  //Endpoint to get a question by id
  app.post('/question', function(req, res) {
    console.log("Request received at question");
    data = logic.getQuestionByQId(req.body.id);
    result = JSON.stringify(data);
    res.status(200).send(result);
  });

  //Endpoint to get the big five questions
  app.get('/bigFiveQuestions', function(req, res) {
    data = logic.getBigFiveQuestions();
    res.status(200).send(data);
  });

  //Endpoint to get the UES questions
  app.get('/UESQuestions', function(req, res) {
    data = logic.getUESQuestions();
    res.status(200).send(data);
  });

  //Endpoint to process the UES data
  app.post('/engagementSurvey', function(req, res) {
    console.log("Request received at engagementSurvey");
    return new Promise(function(resolve, reject) {
      var data = {
        userId: req.body.userId,
        type: "ues",
        value: true
      };

      console.log(data);
      logic.updateUser(data).then(function(userId) {
        response = logic.processUESData(req.body);
        res.status(200).send(response);
      });
    });
  });

  //Endpoint to process the big five data
  app.post('/bigFiveData', function(req, res) {
    console.log("Request received at big five");
    var code = req.body.userId + "_" + Date.now();
    return new Promise(function(resolve, reject) {
      var data = {
        userId: req.body.userId,
        type: "bigfive",
        value: code
      };
      logic.updateUser(data).then(function(userId) {
        response = logic.processBigFive(req.body);
        console.log(code);
        res.status(200).send("<h2 style='padding:20px; text-align:center;'> Thank you for your participation! <br> <br> Please email the following code to wijenayakes@unimelb.edu.au to claim your reward. <br/><br/>Your code is<br/><p style='color:red;font-size:35px;'>" + code + "</p></h2>");
      });
    });
  });

  //Endpoint to update answer
  app.post('/updateAnswer', function(req, res) {
    console.log("Request received at update answer");
    return new Promise(function(resolve, reject) {
      logic.updateAnswer(req.body).then(function(id) {
        resolve(res.status(200).send(id));
      });
    });
  });

};

module.exports = appRouter;
