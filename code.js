//import the data from the database
var utils = require('./utils');
var bigVar = require('./db/bigFiveVariables');
var db = require('./db/database');
var shuffle = require('shuffle-array');

//Function to create the questions
exports.getAllQuestions = function() {
  var questions = utils.questions;
  var response =  shuffle(questions);
  return (response);
};

//Function to get question by Id
exports.getQuestionByQId = function(id) {
  var questions = utils.questions;

  for (var i = 0; i < questions.length; i++) {
    if (questions[i].questionNumber == id) {
      return (questions[i]);
    }
  }
};

//Function to process the big five data
exports.processBigFive = function(result) {
  var userId = result.userId;
  delete result["userId"];
  var answers = result;

  //Save all to the database
  db.saveBigFiveRaw(userId, answers);

  var allScores = {};

  for (var i = 0; i < bigVar.length; i++) {
    var trait = bigVar[i].key;
    var indexes = bigVar[i].values;
    var score = 0;

    for (var j = 0; j < indexes.length; j++) {
      if (answers[indexes[j].id]) {
        var answer = parseInt(answers[indexes[j].id]);
        if (indexes[j].isReverse) {
          answer = (5 - answer) + 1;
        }
        score = score + answer;
      }
    }
    allScores[trait] = score;
  }
  db.saveBigFiveResults(userId, allScores);
};

//Function to get all big five questions
exports.getBigFiveQuestions = function() {
  var questions = db.getBigFiveQuestions();
  return (questions);
};

//Function to save user data
exports.saveUserData = function(user) {
  return new Promise(function(resolve, reject) {
    // Check if the email exists already
    db.getUserByEmail(user.email).then(function(result) {
      if (result) {
        resolve(-1);
      } else {
        db.saveUser(user).then(function(user) {
          var obj = {
            "userId" : user._id.toString(),
            "name" : user.name,
            "email" : user.email,
            "profilePicture" : user.profilePicture,
            "gender" : user.gender,
            "structure" : user.structure,
            "socialPresence" : user.socialPresence
          };
          resolve (obj);
        });
      }
    });
  });
};

//Function to login user
exports.loginUser = function(user) {
  return new Promise(function(resolve, reject) {
    db.loginUser(user).then(function(obj) {
      resolve(obj);
    });
  });
};


//Function to login user
exports.updateUser = function(user) {
  return new Promise(function(resolve, reject) {
    db.updateUser(user).then(function(obj) {
      resolve(obj);
    });
  });
};

//Function to get users in a given group
exports.getGroupUsers = function(query) {
  return new Promise(function(resolve, reject) {
    db.getGroupUsers(query).then(function(users) {
      resolve(users);
    });
  });
};

//Function to save an answer
exports.saveAnswer = function(answer) {
  return new Promise(function(resolve, reject) {

    var ans = {};
    ans.userId = answer.userId;
    ans.questionId = answer.questionId;
    ans.structure = answer.structure;
    ans.socialPresence = answer.socialPresence;
    ans.oldAnswer = answer.oldAnswer;
    ans.oldConfidence = answer.oldConfidence;
    ans.oldComment = answer.oldComment;

    db.saveAnswer(ans).then(function(answerId) {
      exports.saveComment(answer).then(function(commId){
        resolve(commId);
      });
    });
  });
};

//Function to save a comment
exports.saveComment = function(comment) {
  return new Promise(function(resolve, reject) {

    var data = {};
    data.socialPresence = comment.socialPresence;
    data.structure = comment.structure;
    data.questionId = comment.questionId;

    //Check comment order
    db.getAllComments(data).then(function(allComments){
      var comm = {};
      comm.userId = comment.userId;
      comm.userPicture = "bla bla";
      comm.userName = comment.userName;
      comm.questionId = comment.questionId;
      comm.socialPresence = comment.socialPresence;
      comm.structure = comment.structure;
      comm.text = comment.oldComment;
      comm.order = allComments.length + 1;

      db.saveComment(comm).then(function(allFinalComments) {
        resolve(allFinalComments);
      });
    });

  });
};

//Function to update an answer
exports.updateAnswer = function(answer) {
  return new Promise(function(resolve, reject) {
    db.updateAnswer(answer).then(function(answerId) {
      resolve(answerId);
    });
  });
};
