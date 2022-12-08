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
