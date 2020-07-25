//import the data from the database
var utils = require('./utils');
var bigVar = require('./db/bigFiveVariables');
var UESVar = require('./db/UESVariables');
var db = require('./db/database');
var shuffle = require('shuffle-array');

//Function to create the questions
exports.getAllQuestions = function(data) {

  var order = data.order;
  var userId = data.userId;
  var questions = utils.questions;
  var newArr = [];

  var query = {
    socialPresence: data.socialPresence,
    structure: data.structure
  };

  return new Promise(function(resolve, reject) {
    db.getAllCommentCounts(query).then(function(counts) {
      db.getAnswersByUser(userId).then(function(answeredQs) {
        for (var i = 0; i < order.length; i++) {
          var qId = order[i].toString();
          var commCount = 0;

          if (answeredQs.includes(qId)) {
            questions[order[i] - 1].attempted = true;
          } else {
            questions[order[i] - 1].attempted = false;
          }

          for (var j = 0; j < counts.length; j++) {
            if (counts[j]._id == qId) {
              commCount = counts[j].count;
            }
          }
          questions[order[i] - 1].commCount = commCount;
          newArr.push(questions[order[i] - 1]);
        }
        resolve(newArr);
      });
    });
  });
};

//Function to create the questions in the vote page
exports.getAllQuestionsToVote = function(data) {

  var order = data.order;
  var userId = data.userId;
  var questions = utils.questions;

  var query = {
    socialPresence: data.socialPresence,
    structure: data.structure
  };
  var newArr = [];

  return new Promise(function(resolve, reject) {
    db.getAllVoteCounts(query).then(function(counts) {
      db.getVotesByUser(userId).then(function(votedQs) {
        for (var i = 0; i < order.length; i++) {
          var qId = order[i].toString();
          var voteCount = 0;

          if (votedQs.includes(qId)) {
            questions[order[i] - 1].voted = true;
          } else {
            questions[order[i] - 1].voted = false;
          }

          for (var j = 0; j < counts.length; j++) {
            if (counts[j]._id == qId) {
              voteCount = counts[j].count;
            }
          }
          questions[order[i] - 1].voteCount = voteCount;
          newArr.push(questions[order[i] - 1]);
        }
        resolve(newArr);
      });
    });
  });
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

//Function to get all UES questions
exports.getUESQuestions = function() {
  var data = db.getUESQuestions();
  var order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  var questions = [];
  //Randomise the order of questions
  for (var i = 0; i < order.length; i++) {
    data[order[i]].order = i + 1;
    questions.push(data[order[i]]);
  }
  return (questions);
};

//Function to process the UES data and return the big five questions
exports.processUESData = function(result) {

  var userId = result.userId;
  delete result["userId"];
  var answers = result;

  //Save all to the database
  db.saveUESRaw(userId, answers);

  var allScores = {};
  var totalScore = 0;

  for (var i = 0; i < UESVar.length; i++) {
    var trait = UESVar[i].key;
    var indexes = UESVar[i].values;
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
    allScores[trait] = score / 3;
    totalScore += score;
  }

  allScores.total = totalScore / 12;
  db.saveUESResults(userId, allScores);

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
        var order = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
        user.order = order;
        db.saveUser(user).then(function(user) {
          var obj = {
            "userId": user._id.toString(),
            "name": user.name,
            "email": user.email,
            "gender": user.gender,
            "structure": user.structure,
            "socialPresence": user.socialPresence,
            "order": user.order
          };
          if (user.profilePicture) {
            obj.profilePicture = user.profilePicture
          }
          resolve(obj);
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

//Function to get votes by user
exports.getVotesByUser = function(data) {
  return new Promise(function(resolve, reject) {
    db.getVotesByUser(data.userId).then(function(obj) {
      resolve(obj);
    });
  });
};


//Function to get all questions answered by a given use
exports.getAnswersByUser = function(data) {
  var userId = data.userId;
  return new Promise(function(resolve, reject) {
    db.getAnswersByUser(userId).then(function(arr) {
      resolve(arr);
    });
  });
};


//Function to login user
exports.updateUser = function(data) {
  var query = {
    userId: data.userId,
    type: data.type,
    value: data.value
  };
  return new Promise(function(resolve, reject) {
    db.updateUser(query).then(function(obj) {
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

//Function to check username validity
exports.checkUsername = function(name) {
  return new Promise(function(resolve, reject) {
    db.getUserByName(name).then(function(users) {
      if (users) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

//Function to check email validity
exports.checkEmail = function(email) {
  return new Promise(function(resolve, reject) {
    db.getUserByEmail(email).then(function(users) {
      if (users) {
        resolve(false);
      } else {
        resolve(true);
      }
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
      var type;
      if (answer.structure) {
        type = (answer.oldAnswer == "yes") ? true :false;
      }
      var comment = {
        userId: answer.userId,
        questionId: answer.questionId,
        questionText: answer.questionText,
        comment: answer.oldComment,
        socialPresence: answer.socialPresence,
        structure: answer.structure,
        userName: answer.userName,
        isReply: answer.isReply,
        isAgree: type
      };
      exports.saveComment(comment).then(function(result) {
        resolve(result);
      });
    });
  });
};

//Function to save a comment or a reply
exports.saveComment = function(comment) {
  return new Promise(function(resolve, reject) {

    var data = {};
    data.socialPresence = comment.socialPresence;
    data.structure = comment.structure;
    data.questionId = comment.questionId;

    //Check comment order
    db.getAllComments(data).then(function(allComments) {
      //Get user picture
      db.getUserById(comment.userId).then(function(user) {
        var comm = {};
        comm.userId = comment.userId;
        comm.userPicture = user.profilePicture;
        comm.userName = comment.userName;
        comm.questionId = comment.questionId;
        comm.socialPresence = comment.socialPresence;
        comm.structure = comment.structure;
        comm.text = comment.comment;
        comm.order = allComments.length + 1;
        comm.isReply = comment.isReply;
        comm.parentComment = comment.parentComment;
        comm.isAgree = comment.isAgree;

        db.saveComment(comm).then(function(allFinalComments) {
          var final = {
            questionText: comment.questionText,
            questionId: comment.questionId,
            socialPresence: comment.socialPresence,
            structure: comment.structure,
            comments: []
          };
          if (comment.structure) {
            final.comments = exports.structureAllComments(allFinalComments);
          } else {
            final.comments = exports.formatAllComments(allFinalComments);
          }
          resolve(final);
        });
      });
    });
  });
};

//Function to format comments to with the structured format
exports.structureAllComments = function(allFinalComments) {
  //Filter comments and replies into two groups based on isAgree
  var final = {
    yes : [],
    no : [],
    progressY : 0,
    progressN : 0
  };

  var yesComments = [];
  var noComments = [];

  for (var i = 0; i < allFinalComments.length; i++) {
    if (allFinalComments[i].isAgree == true){
      yesComments.push(allFinalComments[i]);
    } else {
      noComments.push(allFinalComments[i]);
    }
  }

  final.yes = exports.formatAllComments(yesComments);
  final.no = exports.formatAllComments(noComments);
  final.progressY = Math.round(final.yes.length / (final.yes.length + final.no.length) * 100)
  final.progressN = Math.round(final.no.length / (final.yes.length + final.no.length) * 100)
  return (final);
};

//Function to format comments for view
exports.formatAllComments = function(allFinalComments) {
  //Arrange comments and replies in order
  var final = [];
  var all_comms = [];
  var all_replies = [];

  for (var i = 0; i < allFinalComments.length; i++) {
    if (allFinalComments[i].isReply == true) {
      all_replies.push(allFinalComments[i]);
    } else {
      all_comms.push(allFinalComments[i]);
    }
  }

  for (var j = 0; j < all_comms.length; j++) {
    var c = {
      id: all_comms[j]._id.toString(),
      profilePicture: all_comms[j].userPicture,
      userId: all_comms[j].userId,
      username: all_comms[j].userName,
      comment: all_comms[j].text,
      order: all_comms[j].order,
      timestamp: all_comms[j].timestamp,
      upVotes: [],
      downVotes: [],
      replies: []
    };

    // Processing the upvotes
    if (all_comms[j].upVotes.length > 0) {
      var upVotes = [];
      for (var x = 0; x < all_comms[j].upVotes.length; x++) {
        upVotes.push(all_comms[j].upVotes[x].userId);
      }
      c.upVotes = upVotes;
    }

    // Processing the downvotes
    if (all_comms[j].downVotes.length > 0) {
      var downVotes = [];
      for (var y = 0; y < all_comms[j].downVotes.length; y++) {
        downVotes.push(all_comms[j].downVotes[y].userId);
      }
      c.downVotes = downVotes;
    }

    //Processing Replies
    if (all_comms[j].replies == true) {
      for (var k = 0; k < all_replies.length; k++) {
        if (all_replies[k].parentComment == c.id) {

          var r = {
            id: all_replies[k]._id.toString(),
            profilePicture: all_replies[k].userPicture,
            username: all_replies[k].userName,
            userId: all_replies[k].userId,
            comment: all_replies[k].text,
            order: all_replies[k].order,
            timestamp: all_replies[k].timestamp,
            upVotes: [],
            downVotes: [],
            replies: []
          };

          // Processing the upvotes of the reply
          if (all_replies[k].upVotes.length > 0) {
            var upVotes = [];
            for (var x = 0; x < all_replies[k].upVotes.length; x++) {
              upVotes.push(all_replies[k].upVotes[x].userId);
            }
            r.upVotes = upVotes;
          }

          // Processing the downvotes of the reply
          if (all_replies[k].downVotes.length > 0) {
            var downVotes = [];
            for (var y = 0; y < all_replies[k].downVotes.length; y++) {
              downVotes.push(all_replies[k].downVotes[y].userId);
            }
            r.downVotes = downVotes;
          }
          c.replies.push(r);
        }
      }
    }
    final.push(c);
  }
  return (final);
};

//Function to update the upvote/downvote count
exports.updateVoteForComment = function(data) {
  var query = {
    isUpvote: data.vote,
    removeVote: data.removeVote,
    commentId: data.commentId,
    userId: data.userId
  };
  var next = {
    socialPresence: data.socialPresence,
    structure: data.structure,
    questionId: data.questionId
  };

  return new Promise(function(resolve, reject) {
    db.updateVoteForComment(query).then(function(commentId) {
      db.getAllComments(next).then(function(comments) {
        var final = {
          questionText: data.questionText,
          questionId: data.questionId,
          socialPresence: data.socialPresence,
          structure: data.structure,
          comments: []
        };

        if (data.structure) {
          final.comments = exports.structureAllComments(comments);
        } else {
          final.comments = exports.formatAllComments(comments);
        }
        resolve(final);
      });
    });
  });
};

//Function to get all comments posted per question
exports.getCommentsForQuestion = function(data) {
  var final = {
    questionText: data.questionText,
    questionId: data.questionId,
    socialPresence: data.socialPresence,
    structure: data.structure,
    comments: []
  }
  return new Promise(function(resolve, reject) {
    db.getAllComments(data).then(function(comments) {
      if (data.structure) {
        final.comments = exports.structureAllComments(comments);
      } else {
        final.comments = exports.formatAllComments(comments);
      }
      resolve(final);
    });
  });
};

//Function to update an answer
exports.updateAnswer = function(answer) {
  return new Promise(function(resolve, reject) {
    var ans = {};
    ans.userId = answer.userId;
    ans.questionId = answer.questionId;
    ans.newAnswer = answer.newAnswer;
    ans.newConfidence = answer.newConfidence;
    ans.newComment = answer.newComment;

    db.updateAnswer(ans).then(function(answerId) {
      db.getUserById(answer.userId).then(function(user) {
        var vote = {
          userId: answer.userId,
          userName: answer.userName,
          userPicture: user.profilePicture,
          questionId: answer.questionId,
          socialPresence: answer.socialPresence,
          structure: answer.structure,
          vote: answer.newAnswer
        };
        db.saveVote(vote).then(function(result) {
          resolve(result);
        });
      });
    });
  });
};

//Function to get a user by ID
exports.getUserById = function(userId) {
  return new Promise(function(resolve, reject) {
    db.getUserById(userId).then(function(user) {
      resolve(user);
    });
  });
};

//Function to get all votes per question
exports.getVotesForQuestion = function(query) {
  return new Promise(function(resolve, reject) {
    db.getVotesForQuestion(query).then(function(votes) {

      db.getAllGroupUsers(query).then(function(users) {
        var finalVotes = [];
        var votedUsers = [];

        //For those who have voted
        for (var i = 0; i < votes.length; i++) {
          var obj = {
            userName: votes[i].userName,
            userPicture: votes[i].userPicture,
            vote: votes[i].vote
          }
          votedUsers.push(votes[i].userId);
          finalVotes.push(obj);
        }

        //For those who have not voted
        for (var j = 0; j < users.length; j++) {
          if (!votedUsers.includes(users[j].userId)) {
            var obj = {
              userName: users[j].name,
              userPicture: users[j].profilePicture,
              vote: 'not-attempted'
            }
            finalVotes.push(obj);
          }
        }

        //Preparing the final response
        var final = {
          questionText: query.questionText,
          votes: finalVotes
        };
        resolve(final);
      });
    });
  });
};
