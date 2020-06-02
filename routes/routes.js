var logic = require('../code');
var utils = require('../utils');

var appRouter = function(app) {

  //Endpoint to save user profile data
  app.post('/user', function(req, res) {
    console.log("Request received at user data");
    console.log(req.body);
    return new Promise(function(resolve, reject) {
      logic.saveUserData(req.body).then(function(obj) {
        resolve(res.status(200).send({
          "id": obj.id,
          "order": obj.qOrder
        }));
      });
    });
  });

  //Endpoint to login
  app.post('/login', function(req, res, next) {
    console.log("Request received at user login");
    return new Promise(function(resolve, reject) {
      logic.loginUser(req.body).then(function(obj) {
          resolve(res.status(200).send(obj));
        })
        .catch(function(error) {
          resolve(res.status(400).send(error.error));
          next(error);
        });
    });
  });

  app.post('/feedback', function(req, res) {

    console.log("Request received at feedback endpoint");
    var userAnswer = {};

    userAnswer.userId = req.body.userId;
    userAnswer.cues = req.body.cues;
    userAnswer.discussion = req.body.discussion;
    userAnswer.questionId = parseInt(req.body.questionId);
    userAnswer.answerId = parseInt(req.body.answerId);
    userAnswer.confidence = parseFloat(req.body.confidence);
    userAnswer.explanation = req.body.explanation;

    return new Promise(function(resolve, reject) {

      logic.saveAnswer(userAnswer).then(function(id) {
        if (userAnswer.cues != "Yes") {
          data = logic.getFeedbackWithoutCues(userAnswer);
        } else {
          data = logic.getFeedbackWithCues(userAnswer);
        }
        result = JSON.stringify(data);
        resolve(res.status(200).send(result));
      });
    });
  });

  //Endpoint to get all the questions and answers
  app.get('/questions', function(req, res) {
    data = logic.getAllQuestions();
    result = JSON.stringify(data);
    res.status(200).send(result);
  });

  //Endpoint to index
  app.get('/', function(req, res) {
    result = JSON.stringify({
      message: "hello world"
    });
    res.status(200).send(result);
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

  //Endpoint to process the big five data
  app.post('/bigFiveData', function(req, res) {
    console.log("Request received at big five");
    response = logic.processBigFive(req.body);
    res.status(200).send("<img src='http://blog.postable.com/wp-content/uploads/2017/07/TY_wedding_header.png' width='100%' height='100%'>");
  });

  //Endpoint to update answer
  app.post('/updateAnswer', function(req, res) {
    console.log("Request received at update answer");
    var userAnswer = {};

    userAnswer.userId = req.body.userId;
    userAnswer.questionId = parseInt(req.body.questionId);
    userAnswer.newAnswerId = parseInt(req.body.answerId);
    userAnswer.newConfidence = parseFloat(req.body.confidence);
    userAnswer.newExplanation = req.body.explanation;

    return new Promise(function(resolve, reject) {
      logic.updateAnswer(userAnswer).then(function(id) {
        resolve(res.status(200).send(id));
      });
    });
  });

};

module.exports = appRouter;
