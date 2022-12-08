var models = require('../models/models.js');
var url = require('url');


exports.adminRequired = function(req, res, next) {
  var isAdmin = req.session.user.isAdmin;
  if (isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
};

// GET /questions
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
    }
    total_questions = simple_questions + normal_questions + complicated_questions;
    });

  models.Quiz_question.findAll(options).then(
    function(questions) {
      res.render('questions/index.ejs', {
        page: _page,
        questions: questions,
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

// DELETE /questions/:id
exports.destroy = function(req, res) {
  console.log(req);
  req.quiz.destroy().then(function() {
    res.redirect('/questions');
  }).catch(function(error) {
    next(error)
  });
};

// GET /questions/:id/edit
exports.edit = function(req, res) {
  var question = req.quiz;

  console.log(question);

  res.render('questions/edit', {
    page: 'quiz-edit',
    question: question,
    errors: []
  });
};

// PUT /questions/:id
exports.update = function(req, res) {
  if (req.files.image) {
    req.question.image = req.files.image.name;
  }

  req.quiz.question = req.body.question.question;
  req.quiz.correct_answer = req.body.question.correct_answer;
  req.quiz.complexity = req.body.question.complexity;

  req.quiz
    .validate()
    .then(
      function(err) {
        if (err) {
          res.render('questions/edit', {
            question: req.quiz,
            errors: err.errors
          });
        } else {
          req.quiz
            .save({
              fields: ['question', 'correct_answer', 'incorrect_answers', 'complexity', 'image']
            })
            .then(function() {
              res.redirect('/questions');
            });
        }
      }
    ).catch(function(error) {
      next(error)
    });
};
