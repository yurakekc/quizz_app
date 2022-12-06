
var path = require('path');
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var dialect = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;
var Sequelize = require('sequelize');

const quiz_questions_data = require("./quiz_questions.json");

var sequelize = new Sequelize(DB_name, user, pwd, {
  dialect: protocol,
  protocol: protocol,
  port: port,
  host: host,
  storage: storage, // only SQLite (.env)
  omitNull: true // only Postgres
});

var quiz_path = path.join(__dirname, 'quiz');
var Quiz_question = sequelize.import(quiz_path);

var user_quiz_path = path.join(__dirname, 'user_quiz');
var User_quiz = sequelize.import(user_quiz_path);

var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

exports.Quiz_question = Quiz_question;
exports.User = User;

sequelize.sync().then(function() {
  User.count().then(function(count) {
    if (count === 0) {
      User.bulkCreate(
        [{
          username: 'admin',
          password: 'admin',
          isAdmin: true
        }, {
          username: 'user',
          password: 'user'
        }]
      ).then(function() {
        User_quiz.count().then(function(count) {
          if (count === 1) {
            Quiz_question.bulkCreate(
              quiz_questions_data
            ).then(function() {
              console.log('Database (quiz table) initialized')
            });
          };
        });
      }).then(function() {
        Quiz_question.count().then(function(count) {
          if (count === 0) {
            Quiz_question.bulkCreate(
              quiz_questions_data
            ).then(function() {
              console.log('Database (quiz table) initialized')
            });
          };
        });
      });
    };
  });
});
