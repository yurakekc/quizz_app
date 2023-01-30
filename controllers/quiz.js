var models = require('../models/models.js');
var url = require('url');

exports.ownershipRequired = function(req, res, next) {
  var objQuizOwner = req.quiz.UserId;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;

  if (isAdmin || objQuizOwner === logUser) {
    next();
  } else {
    res.redirect('/');
  }
};

exports.post = async function(req, res, next) {
  var userQuiz = await models.User_quiz.findOne({
    where: {
      id: req.body.quizId
    }
  });
  var answers;
  if(JSON.parse(userQuiz.answers) === "{}") answers = new Object(); else answers = JSON.parse(userQuiz.answers);
  const answerValues = Object.values(answers);
  const answersLength = answerValues.length;
  const questionsArray = JSON.parse(userQuiz.questions)

  if (answersLength === questionsArray.length)
  {
    var correctAnswers = answerValues.filter((item) =>  item === true).length;  
    var percentageOfCorrectAnswers = (correctAnswers/(answersLength + 1)) * 100;

    var quizResult = {
      result: percentageOfCorrectAnswers + "%"
    }

    res.status(201).send(quizResult).end();
    return;
  }
  else
  {
    var currentQuizId = questionsArray[answersLength]
    var isAnswerCorrect = await models.Quiz_question.findOne({
      where: {
        id: currentQuizId
      }
    }).then(function(quiz) {
      if (quiz.correct_answer === req.body.answear)
      {
        return true;
      }
      else
      {
        return false;  
      }
    }).catch(function(error) {
      next(error)
    });
  
    answers[currentQuizId] = isAnswerCorrect;
    answerValues.push(isAnswerCorrect); 

    console.log(answerValues);
    await models.User_quiz.update({
      answers : answers
    },
    {
      where: {
        id: req.body.quizId
      }
    });

    if (answersLength + 1 === questionsArray.length)
    {
      var correctAnswers = answerValues.filter((item) =>  item === true).length;  
      var percentageOfCorrectAnswers = (correctAnswers/(answersLength + 1)) * 100;
  
      var quizResult = {
        result: percentageOfCorrectAnswers + "%"
      }
  
      res.status(201).send(quizResult).end();
      return;
    }
  }
  
  var nextQuizId = questionsArray[answersLength + 1];
  await models.Quiz_question.findOne({
    where: {
      id: nextQuizId
    }
  }).then(function(quiz) {
    var answers = [...JSON.parse(quiz.incorrect_answers), quiz.correct_answer];
    console.log(answers);
    var isCompleted
    if (answersLength + 1 === questionsArray.length) isCompleted = "Yes"; else isCompleted = "No";

    var response = { 
      totalQuestionsNumber: questionsArray.length,
      questionNumber: answersLength + 1,
      startTime: userQuiz.start_time,
      questionsWithOptions: {
        question: quiz.question,
        isCompleted: isCompleted,
        answers: answers,
      }
    }
    res.send(response);
  }).catch(function(error) {
    next(error)
  });
}

// Autoload :userId
exports.get = async function(req, res, next) {
  var lastUserQuiz = await models.User_quiz.findOne({
    where: {
      user_id: Number(req.params.userId)
    },
    order: [['createdAt', 'DESC' ]]   
  });

var complexity;

if (lastUserQuiz == null)
{
  complexity = "simple";
}
else
{
  const answersObj = JSON.parse(lastUserQuiz.answers);
  const questionsArray = JSON.parse(lastUserQuiz.questions)
  var answers = Object.values(answersObj);
  var correctAnswers = answers.filter((item) =>  item === true).length;  
  var percentageOfCorrectAnswers = (correctAnswers/questionsArray.length) * 100;

  if (percentageOfCorrectAnswers < 70)
  {
    complexity = lastUserQuiz.complexity
  }
  else
  {
    complexity = ComplexityNextStateMachine(lastUserQuiz.complexity)
  }
}

var quizQuestionIds = [];

await models.Quiz_question.findAll({
  attributes: [
    'id'
  ],
  where: {
    complexity: complexity
  },
  raw: true,
}).then(function(questionIds){
  console.log(questionIds);
  while(quizQuestionIds.length < 5) // number of questions
  {
      var quizQuestionId = Math.floor(Math.random() * questionIds.length);
      console.log(quizQuestionId);
      var questionId = questionIds[quizQuestionId].id;

      if(!quizQuestionIds.includes(questionId)) 
      {
        quizQuestionIds.push(questionId);
     }
  }
});

var userQuizModel = { 
  user_id: req.params.userId,
  questions: quizQuestionIds,
  answers: JSON.stringify(new Object()),
  complexity: complexity,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  start_time: Date.now()
}
var userQuiz = await models.User_quiz.build(userQuizModel);
await userQuiz.save();

await models.Quiz_question.findOne({
    where: {
      id: quizQuestionIds[0]
    }
  }).then(function(quiz) {
    var answers = [...JSON.parse(quiz.incorrect_answers), quiz.correct_answer];
    var response = { 
        totalQuestionsNumber: userQuizModel.questions.length,
        questionNumber: 1,
        startTime: userQuizModel.start_time,
        questionsWithOptions: {
          question: quiz.question,
          isCompleted: "No",
          answers: answers,
        }
      }

    res.send(response);
  }).catch(function(error) {
    next(error)
  });
};

function ComplexityNextStateMachine(currentState) {
  var nextState;

  if (currentState === "simple")
  {
    nextState = "normal";
  } 
  else if (currentState === "normal")
  {
    nextState = "complicated";
  }
  else if (currentState === "complicated")
  {
    nextState = "complicated";
  }

  return nextState;
}

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz_question.find({
    where: {
      id: Number(quizId)
    }
  }).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else {
      next(new Error('Nonexistent quizId=' + quizId))
    }
  }).catch(function(error) {
    next(error)
  });
};

// GET /quizzes
exports.index = function(req, res) {
  var options = {};
  var query = url.parse(req.url, true).query;

  if (JSON.stringify(query) != '{}' && query.search != '') {
    options = {
      where: ['question like ?', '%' + query.search.replace(/\s+/g, '%') + '%']
    };
    console.log(options);
  }

  var _page = 'quiz-index';
  if (req.user) {
    options.where = {
      UserId: req.user.id
    }
    _page = 'quiz-index-user';
  }
  models.Quiz_question.findAll().then(function(quiz_questions) {
    simple_questions = 0;
    normal_questions = 0;
    complicated_questions = 0;
    for (const key in quiz_questions) {
      complexity = quiz_questions[key].complexity
      if (complexity == "simple"){
        simple_questions += 1
      }else if (complexity == "normal"){
        normal_questions += 1

      }else if (complexity == "complicated"){
        complicated_questions += 1
      }
      console.log("simple_questions = " + simple_questions)
      console.log("normal_questions = " + normal_questions)
      console.log("complicated_questions = " + complicated_questions)
    }
    total_questions = simple_questions + normal_questions + complicated_questions;
    });

  models.Quiz_question.findAll(options).then(
    function(quizzes) {
      res.render('questions/index.ejs', {
        page: _page,
        quizzes: quizzes,
        total_questions: total_questions,
        simple_questions: simple_questions,
        normal_questions: normal_questions,
        complicated_questions: complicated_questions,
        errors: []
      });
    }
  ).catch(function(error) {
    next(error)
  });
};

// GET /quizzes/:id
exports.show = function(req, res) {
  res.render('quizzes/show', {
    page: 'quiz-show',
    quiz: req.quiz,
    errors: []
  });
};

// GET /quizzes/:id/answer
exports.correct_answer = function(req, res) {
  var result = 'Не правильно';
  if (req.query.correct_answer === req.quiz.correct_answer) {
    result = 'Правильно';
  }
  res.render(
    'quizzes/correct_answer', {
      page: 'quiz-correct_answer',
      quiz: req.quiz,
      correct_answer: result,
      errors: []
    }
  );
};

// GET /quizzes/new
exports.new = function(req, res) {
  var quiz = models.Quiz_question.build({
    questions: 'Question text.',
    correct_answer: 'Answer text.'
  });

  res.render('quizzes/new', {
    page: 'quiz-new',
    quiz: quiz,
    errors: []
  });
};

// POST /quizzes/create
exports.create = function(req, res) {

  req.body.quiz.UserId = req.session.user.id;
  if (req.files.image) {
    req.body.quiz.image = req.files.image.name;
  }

  var quiz = models.Quiz_question.build(req.body.quiz);

  quiz
    .validate()
    .then(
      function(err) {
        if (err) {
          res.render('quizzes/new', {
            page: 'quiz-new',
            quiz: quiz,
            errors: err.errors
          });
        } else {
          quiz
            .save({
              fields: ['questions', 'correct_answer', 'complexity', 'image']
            })
            .then(function() {
              res.redirect('/quizzes')
            })
        }
      }
    ).catch(function(error) {
      next(error)
    });

};
