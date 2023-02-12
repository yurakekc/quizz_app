let models = require('../models/models.js');
let url = require('url');


exports.adminRequired = function(req, res, next) {
  let isAdmin = req.session.user.isAdmin;
  if (isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
};

// GET /questions
exports.index = function(req, res, next) {
  let options = {};
  let query = url.parse(req.url, true).query;

  if (JSON.stringify(query) !== '{}' && query.search !== '') {
    options = {
      where: ['question like ?', '%' + query.search.replace(/\s+/g, '%') + '%']
    };
    console.log(options);
  }

  let _page = 'quiz-index';
  if (req.user) {
    options.where = {
      UserId: req.user.id
    }
    _page = 'quiz-index-user';
  }

  let simple_questions = 0;
  let normal_questions = 0;
  let complicated_questions = 0;
  let total_questions;

  models.Quiz_question.findAll().then(function(quiz_questions) {
    for (const key in quiz_questions) {
      let complexity = quiz_questions[key].complexity
      if (complexity === "simple"){
        simple_questions += 1
      } else if (complexity === "normal"){
        normal_questions += 1
      } else if (complexity === "complicated"){
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
exports.destroy = function(req, res, next) {
  console.log(req);
  req.quiz.destroy().then(function() {
    res.redirect('/questions');
  }).catch(function(error) {
    next(error)
  });
};

// GET /questions/:id/edit
exports.edit = function(req, res) {
  let question = req.quiz;

  console.log(question);

  res.render('questions/edit', {
    page: 'quiz-edit',
    question: question,
    errors: []
  });
};

// PUT /questions/:id
exports.update = function(req, res, next) {
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
