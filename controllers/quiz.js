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
    },
    include: [{
      model: models.Comment
    }]
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
// GET /users/:userId/quizzes
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

  models.Quiz_question.findAll(options).then(
    function(quizzes) {
      res.render('quizzes/index.ejs', {
        page: _page,
        quizzes: quizzes,
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
              fields: ['questions', 'correct_answer', 'UserId', 'complexity', 'image']
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

// GET /quizzes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;

  console.log(quiz);

  res.render('quizzes/edit', {
    page: 'quiz-edit',
    quiz: quiz,
    errors: []
  });
};

// PUT /quizzes/:id
exports.update = function(req, res) {
  if (req.files.image) {
    req.quiz.image = req.files.image.name;
  }
  req.quiz.questions = req.body.quiz.questions;
  req.quiz.correct_answer = req.body.quiz.correct_answer;
  req.quiz.complexity = req.body.quiz.complexity;

  req.quiz
    .validate()
    .then(
      function(err) {
        if (err) {
          res.render('quizzes/edit', {
            quiz: req.quiz,
            errors: err.errors
          });
        } else {
          req.quiz
            .save({
              fields: ['questions', 'correct_answer', 'complexity', 'image']
            })
            .then(function() {
              res.redirect('/quizzes');
            });
        }
      }
    ).catch(function(error) {
      next(error)
    });
};

// DELETE /quizzes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then(function() {
    res.redirect('/quizzes');
  }).catch(function(error) {
    next(error)
  });
};
