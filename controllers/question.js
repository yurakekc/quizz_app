var models = require('../models/models.js');
var url = require('url');


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
    function(quizzes) {
      res.render('quizzes/index.ejs', {
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
