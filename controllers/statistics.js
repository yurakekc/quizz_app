var models = require('../models/models.js');

exports.calculate = function(req, res, next) {
  var options = { where :{
    complexity: "complicated"
  }}
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
      res.render('statistics', {
        page: 'statistics',
        total_questions: total_questions,
        simple_questions: simple_questions,
        normal_questions: normal_questions,
        complicated_questions: complicated_questions,
      });
    });
}

