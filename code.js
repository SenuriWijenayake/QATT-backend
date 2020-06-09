//import the data from the database
var utils = require('./utils');
var bigVar = require('./db/bigFiveVariables');
var db = require('./db/database');
var shuffle = require('shuffle-array');

exports.shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

//Function to create the questions and answers
exports.getAllQuestions = function(set) {

  var questions = utils.questions;
  var response = [];

  for (var i = 0; i < questions.length; i++) {
    var ques = questions[i];

    var q = {};
    q.questionId = ques.questionNumber;
    q.questionText = ques.questionText;
    q.questionImg = ques.img ? ques.img : null;
    q.answers = ques.answers;

    response.push(q);
  }
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
exports.saveAnswer = function(ans) {

  var answer = {};
  answer.userId = ans.userId;
  answer.questionId = ans.questionId;
  answer.oldAnswerId = ans.answerId;
  answer.oldConfidence = ans.confidence;
  answer.newAnswerId = ans.answerId;
  answer.newConfidence = ans.confidence;

  return new Promise(function(resolve, reject) {
    db.saveAnswer(answer).then(function(answerId) {
      resolve(answerId);
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
