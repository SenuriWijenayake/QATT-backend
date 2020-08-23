//Import the mongoose module
var mongoose = require('mongoose');
var mongoDB = 'mongodb://admin:admin1234@ds041144.mlab.com:41144/qatt';

// var mongoDB = 'mongodb://localhost:27017/study5';

mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

//Importing schemas
var Result = require('./schemas/result');
var UESResult = require('./schemas/UESResult');
var User = require('./schemas/user');
var Answer = require('./schemas/answer');
var BigFiveRaw = require('./schemas/bigFiveRaw');
var UESRaw = require('./schemas/UESRaw');
var Comment = require('./schemas/comment');
var Vote = require('./schemas/vote');
var Event = require('./schemas/event');
var Notification = require('./schemas/notification');
var Session = require('./schemas/session');
var bigFiveQuestions = require('./bigFiveQuestions');
var UESQuestions = require('./UESQuestions');

//Function to save the saw big five results to the database
exports.saveBigFiveRaw = function(userId, results) {
  var result = new BigFiveRaw({
    userId: userId,
    allAnswers: results
  });

  result.save(function(err) {
    if (err) throw err;
    console.log('Big five raw answers saved successfully!');
  });
};

//Function to save the UES raw answers
exports.saveUESRaw = function(userId, results) {
  var result = new UESRaw({
    userId: userId,
    allAnswers: results
  });

  result.save(function(err) {
    if (err) throw err;
    console.log('UES raw answers saved successfully!');
  });
};

//Function to save the big five results to the database
exports.saveBigFiveResults = function(userId, results) {
  var result = new Result({
    userId: userId,
    Extraversion: results.Extraversion,
    Agreeableness: results.Agreeableness,
    Conscientiousness: results.Conscientiousness,
    Neuroticism: results.Neuroticism,
    Openness: results.Openness
  });

  result.save(function(err) {
    if (err) throw err;
    console.log('Results saved successfully!');
  });
};

//Function to save the UEs results to the database
exports.saveUESResults = function(userId, results) {
  var result = new UESResult({
    userId: userId,
    FA: results.FA,
    PU: results.PU,
    AE: results.AE,
    RW: results.RW,
    total: results.total,
  });

  result.save(function(err) {
    if (err) throw err;
    console.log('UESResults saved successfully!');
  });
};

//Function to get user by email
exports.getUserByEmail = function(email) {
  var query = {
    email: email
  };
  return new Promise(function(resolve, reject) {
    User.findOne(query, function(err, user) {
      resolve(user);
    });
  });
};

//Function to get user by name
exports.getUserByName = function(name) {
  var query = {
    name: name
  };
  return new Promise(function(resolve, reject) {
    User.findOne(query, function(err, user) {
      resolve(user);
    });
  });
};

//Function to get user by id
exports.getUserById = function(userId) {
  var query = {
    _id: mongoose.Types.ObjectId(userId)
  };
  return new Promise(function(resolve, reject) {
    User.findOne(query, function(err, user) {
      resolve(user);
    });
  });
};

//Function to get all votes per question
exports.getVotesForQuestion = function(data) {
  var query = {
    questionId: data.questionId,
    structure: data.structure,
    socialPresence: data.socialPresence
  };
  return new Promise(function(resolve, reject) {
    Vote.find(query, 'userId userName userPicture vote', function(err, res) {
      resolve(res);
    });
  });
};

//Function to get all questions answered by user
exports.getAnswersByUser = function(userId) {
  var query = {
    userId: userId
  };
  return new Promise(function(resolve, reject) {
    Answer.find(query, 'questionId', function(err, res) {
      var arr = [];
      for (var i = 0; i < res.length; i++) {
        arr.push(res[i].questionId);
      }
      resolve(arr);
    });
  });
};

//Function to get all notifications
exports.getNotifications = function(data) {
  var query = {
    userId: {
      $ne: data.userId
    },
    timestamp: {
      $gt: data.since
    }
  };
  return new Promise(function(resolve, reject) {
    Notification.find(query, function(err, res) {
      var final = [];
      for (var i = 0; i < res.length; i++) {
        var obj = {
          id: res[i]._id.toString(),
          userId : res[i].userId,
          timestamp : res[i].timestamp,
          content : res[i].content,
          type : res[i].type
        }
        final.push(obj);
      }
      resolve(final);
    });
  });
};


//Function to get all questions voted by a user
exports.getVotesByUser = function(userId) {
  var query = {
    userId: userId
  };
  return new Promise(function(resolve, reject) {
    Vote.find(query, 'questionId', function(err, res) {
      var arr = [];
      for (var i = 0; i < res.length; i++) {
        arr.push(res[i].questionId);
      }
      resolve(arr);
    });
  });
};

//Function to get all comments per question
exports.getCommentsForQuestion = function(data) {
  var query = {
    socialPresence: data.socialPresence,
    structure: data.structure,
    questionId: data.questionId
  };
  return new Promise(function(resolve, reject) {
    Comment.find(query, function(err, res) {
      resolve(res);
    });
  });
};

//Function to save user details
exports.saveUser = function(user) {
  return new Promise(function(resolve, reject) {
    var newUser = new User({
      name: user.name,
      email: user.email,
      password: user.password,
      gender: user.gender,
      genderSpecified: user.genderSpecified,
      age: user.age,
      education: user.education,
      field: user.field,
      structure: user.structure,
      socialPresence: user.socialPresence,
      profilePicture: user.profilePicture,
      order: user.order,
      ethnicity: user.ethnicity
    });

    newUser.save(function(err, newUser) {
      if (err) reject(err);
      resolve(newUser);
    });
  });
};

//Function to login user
exports.loginUser = function(user) {
  var password = user.password;
  var query = {
    email: user.email
  };
  return new Promise(function(resolve, reject) {
    User.findOne(query, function(err, result) {
      if (result == null) {
        resolve(-1);
      } else if (result.password == password) {
        var data = {
          userId: result._id.toString(),
          startTime: user.startTime,
          isStart: true
        };
        exports.updateSession(data).then(function(sessionId) {
          result.sessionId = sessionId;
          result.startTime = user.startTime;
          resolve(result);
        });
      } else {
        resolve(-2);
      }
    });
  });
};

//Function to update user
exports.updateUser = function(data) {
  var newData = {};
  var query = {
    _id: mongoose.Types.ObjectId(data.userId)
  };

  if (data.type == "firstVisit") {
    newData = {
      firstVisit: data.value
    }
  } else if (data.type == "completedComments") {
    newData = {
      completedComments: data.value
    }
  } else if (data.type == "completedVotes") {
    newData = {
      completedVotes: data.value
    }
  } else if (data.type == "ues") {
    newData = {
      completedUES: data.value
    }
  } else {
    newData = {
      code: data.value
    }
  }

  return new Promise(function(resolve, reject) {
    User.findOneAndUpdate(query, newData, {
      upsert: false
    }, function(err, newAnswer) {
      if (err) reject(err);
      resolve(newAnswer._id.toString());
    });
  });

};

//Update user sessions
exports.updateSession = function(data) {
  //If the session is new create session
  if (data.isStart == true) {
    return new Promise(function(resolve, reject) {
      var newSession = new Session({
        userId: data.userId,
        startTime: data.startTime
      });
      newSession.save(function(err, newSession) {
        if (err) reject(err);
        resolve(newSession._id.toString());
      });
    });
    //Else update endTime
  } else {
    var query = {
      _id: mongoose.Types.ObjectId(data.sessionId)
    };
    var newData = {
      endTime: data.endTime
    };
    return new Promise(function(resolve, reject) {
      Session.findOneAndUpdate(query, newData, {
        upsert: false
      }, function(err, newAnswer) {
        if (err) reject(err);
        resolve(newAnswer._id.toString());
      });
    });
  }
};


//Function to find the last session of a user
exports.getLastSessionByUserId = function(data) {
  var query = {
    userId: data.userId,
    _id: {
      $ne: mongoose.Types.ObjectId(data.sessionId)
    }
  };
  return new Promise(function(resolve, reject) {
    Session.findOne(query, null, {
      sort: {
        '_id': -1
      }
    }, function(err, session) {
      if (session != null) {
        var time = session['endTime'] != null ? session['endTime'] : session['startTime']
      } else {
        var time = Date.now();
      }
      console.log(time);
      resolve(time);
    });
  });
};



//Function to find users in a given group
exports.getGroupUsers = function(data) {
  var thisUser = data.userId;
  var query = {
    socialPresence: data.socialPresence,
    structure: data.structure,
    _id: {
      $ne: mongoose.Types.ObjectId(thisUser)
    },
    email: {
      $ne: "admin@gmail.com"
    }
  };
  return new Promise(function(resolve, reject) {
    User.find(query, 'name gender age profilePicture', function(err, result) {
      resolve(result);
    });
  });
};

//Function to find all users in a group
exports.getAllGroupUsers = function(data) {
  var query = {
    socialPresence: data.socialPresence,
    structure: data.structure,
    email: {
      $ne: "admin@gmail.com"
    }
  };
  return new Promise(function(resolve, reject) {
    User.find(query, 'name profilePicture', function(err, result) {
      var final = [];
      for (var i = 0; i < result.length; i++) {
        var obj = {
          userId: result[i]._id.toString(),
          name: result[i].name,
          profilePicture: result[i].profilePicture
        };
        final.push(obj);
      }
      resolve(final);
    });
  });
};

//Function to find all comments for a question in group
exports.getAllComments = function(data) {
  return new Promise(function(resolve, reject) {
    Comment.aggregate([{
        $match: {
          socialPresence: data.socialPresence,
          structure: data.structure,
          questionId: data.questionId
        }
      },
      {
        $addFields: {
          upCount: {
            $size: '$upVotes'
          }
        }
      },
      {
        $sort: {
          upCount: -1,
          totalVotes: -1
        }
      }
    ], function(err, result) {
      resolve(result);
    });
  });
};

//Function to update the vote count of a comment
exports.updateVoteForComment = function(data) {
  var query = {
    _id: mongoose.Types.ObjectId(data.commentId)
  };

  var vote = new Event({
    userId: data.userId,
    timestamp: data.timestamp
  });

  var newData = {};
  var content, type;

  if (data.isUpvote & !data.removeVote) {
    newData = {
      $push: {
        upVotes: vote
      },
      $inc: {
        'totalVotes': 1
      }
    }

    type = "upvote";
    content = data.userName + " upvoted a comment on '" + data.questionText + "'.";

  } else if (!data.isUpvote & !data.removeVote) {
    newData = {
      $push: {
        downVotes: vote
      },
      $inc: {
        'totalVotes': -1
      }
    }

    type = "downvote";
    content = data.userName + " downvoted a comment on '" + data.questionText + "'.";

  } else if (data.isUpvote & data.removeVote) {
    newData = {
      $pull: {
        upVotes: {
          userId: data.userId
        }
      },
      $inc: {
        'totalVotes': -1
      }
    }
  } else if (!data.isUpvote & data.removeVote) {
    newData = {
      $pull: {
        downVotes: {
          userId: data.userId
        }
      },
      $inc: {
        'totalVotes': 1
      }
    }
  }

  return new Promise(function(resolve, reject) {
    Comment.findOneAndUpdate(query, newData, {
      upsert: true
    }, function(err, newAnswer) {
      if (err) reject(err);

      //Save notification
      if (!data.removeVote){
        exports.saveNotification(data.userId, type, content, data.timestamp);
      }

      resolve(newAnswer._id.toString());
    });
  });
};


//Function to update parent comment
exports.updateParentCommentById = function(parent) {
  var query = {
    _id: mongoose.Types.ObjectId(parent)
  };

  var newData = {
    replies: true
  };

  return new Promise(function(resolve, reject) {
    Comment.findOneAndUpdate(query, newData, {
      upsert: true
    }, function(err, newAnswer) {
      if (err) reject(err);
      resolve(newAnswer._id.toString());
    });
  });
};

//Function to find all comment counts
exports.getAllCommentCounts = function(query) {
  return new Promise(function(resolve, reject) {
    Comment.aggregate([{
      $match: {
        socialPresence: query.socialPresence,
        structure: query.structure
      }
    }, {
      $group: {
        _id: "$questionId",
        count: {
          $sum: 1
        }
      }
    }], function(err, result) {
      resolve(result);
    });
  });
};


//Funtion to find all answers for the question
exports.getInitialAnswersForQuestion = function(query) {
  return new Promise(function(resolve, reject) {
    Answer.aggregate([{
      $match: {
        socialPresence: query.socialPresence,
        structure: query.structure,
        questionId: query.questionId
      }
    }, {
      $group: {
        _id: "$oldAnswer",
        count: {
          $sum: 1
        }
      }
    }], function(err, result) {
      resolve(result);
    });
  });
};


//Function to find all vote counts
exports.getAllVoteCounts = function(query) {
  return new Promise(function(resolve, reject) {
    Vote.aggregate([{
      $match: {
        socialPresence: query.socialPresence,
        structure: query.structure
      }
    }, {
      $group: {
        _id: "$questionId",
        count: {
          $sum: 1
        }
      }
    }], function(err, result) {
      resolve(result);
    });
  });
};

//Function to save an answer
exports.saveAnswer = function(answer) {
  return new Promise(function(resolve, reject) {
    var newAnswer = new Answer({
      userId: answer.userId,
      questionId: answer.questionId,
      oldAnswer: answer.oldAnswer,
      oldConfidence: answer.oldConfidence,
      oldComment: answer.oldComment,
      socialPresence: answer.socialPresence,
      structure: answer.structure
    });

    newAnswer.save(function(err, newAnswer) {
      if (err) reject(err);
      resolve(newAnswer._id.toString());
    });
  });
};

//Function to save a vote
exports.saveVote = function(answer) {
  return new Promise(function(resolve, reject) {
    var newVote = new Vote({
      userId: answer.userId,
      userName: answer.userName,
      // userPicture: answer.userPicture,
      questionId: answer.questionId,
      socialPresence: answer.socialPresence,
      structure: answer.structure,
      vote: answer.vote
    });

    newVote.save(function(err, newVote) {
      if (err) reject(err);

      //Save notification
      var content = answer.userName + " added their final vote on '" + answer.questionText + "'.";
      exports.saveNotification(answer.userId, "vote", content, answer.timestamp);

      resolve(newVote._id.toString());
    });
  });
};

//Function to save a comment
exports.saveComment = function(comment) {
  return new Promise(function(resolve, reject) {

    var newComment = new Comment({
      userId: comment.userId,
      // userPicture: comment.userPicture,
      userName: comment.userName,
      questionId: comment.questionId,
      socialPresence: comment.socialPresence,
      structure: comment.structure,
      text: comment.text,
      order: comment.order,
      isReply: comment.isReply,
      parentComment: comment.parentComment,
      isAgree: comment.isAgree
    });

    newComment.save(function(err, nC) {
      if (err) reject(err);
      //If a reply, update parent
      if (comment.isReply == true) {
        //Adding a notification
        var content = comment.userName + " replied to a comment on '" + comment.questionText + "'.";
        exports.saveNotification(comment.userId, "reply", content, comment.timestamp);

        //Update parent
        var parentComment = comment.parentComment;
        exports.updateParentCommentById(parentComment).then(function() {
          var data = {};
          data.socialPresence = newComment.socialPresence;
          data.structure = newComment.structure;
          data.questionId = newComment.questionId;

          exports.getAllComments(data).then(function(allFinalComments) {
            resolve(allFinalComments)
          });
        });
      } else {

        //Adding a notification
        var content = comment.userName + " added a new comment on '" + comment.questionText + "'.";
        exports.saveNotification(comment.userId, "comment", content, comment.timestamp);

        var data = {};
        data.socialPresence = newComment.socialPresence;
        data.structure = newComment.structure;
        data.questionId = newComment.questionId;

        exports.getAllComments(data).then(function(allFinalComments) {
          resolve(allFinalComments)
        });
      }
    });
  });
};

//Function to update an answer
exports.updateAnswer = function(answer) {

  var query = {
    userId: answer.userId,
    questionId: answer.questionId
  };
  var newData = {
    newAnswer: answer.newAnswer,
    newConfidence: answer.newConfidence,
    newComment: answer.newComment,
    editTime: Date.now()
  };

  return new Promise(function(resolve, reject) {
    Answer.findOneAndUpdate(query, newData, {
      upsert: true
    }, function(err, newAnswer) {
      if (err) reject(err);
      resolve(newAnswer._id.toString());
    });
  });
};


//Function to get the big five questions
exports.getBigFiveQuestions = function() {
  return (bigFiveQuestions);
};

//Function to get the big five questions
exports.getUESQuestions = function() {
  return (UESQuestions);
};

//Function to get all profile pictures
exports.getAllProfilePictures = function() {
  return new Promise(function(resolve, reject) {
    User.find({}, 'email profilePicture', function(err, res) {
      resolve(res);
    });
  });
};

//Function to create a notification
exports.saveNotification = function(userId, type, content, timestamp) {
  var notification = new Notification({
    userId: userId,
    type: type,
    content: content,
    timestamp: timestamp
  });

  notification.save(function(err) {
    if (err) throw err;
    console.log('Notification saved successfully!');
  });
};


//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
