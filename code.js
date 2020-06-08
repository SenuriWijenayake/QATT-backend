//import the data from the database
var utils = require('./utils');
var bigVar = require('./db/bigFiveVariables');
var db = require('./db/database');
var shuffle = require('shuffle-array');

//Function to get feedback wth letters
exports.getFeedback = function(userAnswer) {

  var final = [];
  var question = utils.getQuestionByNumber(userAnswer.questionId);

  var answers = question.answers;
  var sizeValues = question.sizeValues;
  var selected = utils.getAnswerById(answers, userAnswer.answerId);

  //Add my answer
  var obj = {
    "avatar": userAnswer.myAvatar,
    "answer": selected.answer,
    "username": userAnswer.username,
    "order": 1,
    "isInMajority": question.isMajority
  };
  final.push(obj);

  //Who are the others supporting me?
  var othersSupportMe;
  var others;

  if (question.isMajority) {
    othersSupportMe = sizeValues[0];
    others = sizeValues[1];
  } else {
    othersSupportMe = sizeValues[1];
    others = sizeValues[0];
  }

  //Add their answers as well
  var count = shuffle([2, 3, 4, 5]);
  var quotesPosition = shuffle([1, 2, 3, 4]);
  var userProfiles = [{
      "lAvatar": "a.png",
      "aAvatar": "neutral.png",
      "lUsername": "JG",
      "aUsername": "User 1"
    },
    {
      "lAvatar": "b.png",
      "aAvatar": "neutral.png",
      "lUsername": "NB",
      "aUsername": "User 2"
    },
    {
      "lAvatar": "d.png",
      "aAvatar": "neutral.png",
      "lUsername": "DH",
      "aUsername": "User 4"
    },
    {
      "lAvatar": "e.png",
      "aAvatar": "neutral.png",
      "lUsername": "BS",
      "aUsername": "User 5"
    }
  ];
  console.log(count, quotesPosition);

  //Others are in the same answer as me
  if (othersSupportMe != 0) {
    for (i = 0; i < othersSupportMe; i++) {
      var profileSelected = userProfiles[i];
      var obj = {
        "avatar": (userAnswer.cues == 'letter') ? profileSelected.lAvatar : profileSelected.aAvatar,
        "answer": selected.answer,
        "username": (userAnswer.cues == 'letter') ? profileSelected.lUsername : profileSelected.aUsername,
        "order": count[i],
        "isInMajority": question.isMajority,
        "quote": utils.getQuote(question, selected.id, quotesPosition[i])
      };

      final.push(obj);
    }
  }

  //Add the second best ansers
  var nextAnswer = utils.getUnselectedAnswersOrdered(answers, userAnswer.answerId, question.correctOrder)[0];
  if (others != 0) {
    for (i = 0; i < others; i++) {
      var profileSelected = userProfiles[(othersSupportMe + i)];
      var obj = {
        "avatar": (userAnswer.cues == 'letter') ? profileSelected.lAvatar : profileSelected.aAvatar,
        "answer": nextAnswer.answer,
        "username": (userAnswer.cues == 'letter') ? profileSelected.lUsername : profileSelected.aUsername,
        "order": count[4 - (i + 1)],
        "isInMajority": !question.isMajority,
        "quote": utils.getQuote(question, nextAnswer.id, quotesPosition[4 - (i + 1)])
      };
      final.push(obj);
    }
  }

  var response = {
    'question': question,
    'feedback': final
  };
  return (response);
  console.log(response);
};


//Function to get feedback with no changes
exports.getNoChangeFeedback = function(userAnswer, feedback) {
  var data = [];
  var question = utils.getQuestionByNumber(userAnswer.questionId);
  var allAnswers = question.answers;

  //Set my answer
  var me = utils.getAnswerByOrderId(feedback, 1);
  var myNewAnswer = utils.getAnswerById(allAnswers, userAnswer.newAnswerId);
  var hasChanged = (myNewAnswer.answer == me.answer) ? false : true;

  var obj = {
    "avatar": me.avatar,
    "answer": me.answer,
    "newAnswer": myNewAnswer.answer,
    "username": me.username,
    "order": 1,
    "hasChanged": hasChanged
  };

  data.push(obj);

  //No changes to others answers
  for (var i = 0; i < feedback.length; i++) {
    if (feedback[i].order != 1) {
      var obj = {
        "avatar": feedback[i].avatar,
        "answer": feedback[i].answer,
        "username": feedback[i].username,
        "newAnswer": feedback[i].answer,
        "order": feedback[i].order,
        "hasChanged": false
      };
      data.push(obj);
    }
  }

  return (data);

};


//Function to get updated feedback
exports.getUpdatedFeedback = function(userAnswer, feedback) {

  var data = [];
  var question = utils.getQuestionByNumber(userAnswer.questionId);
  var allAnswers = question.answers;

  //Set my answer
  var me = utils.getAnswerByOrderId(feedback, 1);
  var myNewAnswer = utils.getAnswerById(allAnswers, userAnswer.newAnswerId);
  var hasChanged = (myNewAnswer.answer == me.answer) ? false : true;

  var obj = {
    "avatar": me.avatar,
    "answer": me.answer,
    "newAnswer": myNewAnswer.answer,
    "username": me.username,
    "order": 1,
    "hasChanged": hasChanged
  };

  data.push(obj);

  //Separate the others responses as majority and minority
  var othersInMaj = [];
  var othersInMin = [];
  var othersInMinIds = [];
  var majorityAnswer;

  for (var i = 0; i < feedback.length; i++) {
    if (feedback[i].order != 1) {
      if (feedback[i].isInMajority) {
        othersInMaj.push(feedback[i]);
        majorityAnswer = feedback[i].answer;
        //No changes for these answers
        var obj = {
          "avatar": feedback[i].avatar,
          "answer": feedback[i].answer,
          "newAnswer": feedback[i].answer,
          "username": feedback[i].username,
          "order": feedback[i].order,
          "hasChanged": false
        };
        data.push(obj);
      } else {
        //For those who are in the minority there will be changes
        othersInMin.push(feedback[i]);
        othersInMinIds.push(feedback[i].order);
      }
    }
  }

  if (othersInMin.length != 0) {
    var oneToBeChanged = shuffle(othersInMinIds)[0];
    for (var i = 0; i < othersInMin.length; i++) {
      if (othersInMin[i].order != oneToBeChanged) {
        //No changes for these answers
        var obj = {
          "avatar": othersInMin[i].avatar,
          "answer": othersInMin[i].answer,
          "newAnswer": othersInMin[i].answer,
          "username": othersInMin[i].username,
          "order": othersInMin[i].order,
          "hasChanged": false
        };
        data.push(obj);
      } else {
        //For the one that needs to be changed
        var obj = {
          "avatar": othersInMin[i].avatar,
          "answer": othersInMin[i].answer,
          "username": othersInMin[i].username,
          "newAnswer": majorityAnswer,
          "order": othersInMin[i].order,
          "hasChanged": true
        };
        data.push(obj);
      }
    }
  }
  return (data);
};

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

//Function to update an answer with any feedback
exports.updateAnswerWithFeedback = function(answer, isUpdate) {
  return new Promise(function(resolve, reject) {
    db.updateAnswerWithFeedback(answer, isUpdate).then(function(answerId) {
      resolve(answerId);
    });
  });
};

//Function to update an answer events
exports.updateAnswerEvents = function(answer) {
  return new Promise(function(resolve, reject) {
    db.updateAnswerEvents(answer).then(function(answerId) {
      resolve(answerId);
    });
  });
};
