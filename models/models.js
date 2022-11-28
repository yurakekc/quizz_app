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

var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

Comment.belongsTo(Quiz_question);
Quiz_question.hasMany(Comment);

Quiz_question.belongsTo(User);
User.hasMany(Quiz_question);

exports.Quiz_question = Quiz_question;
exports.Comment = Comment;
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
        console.log('Database (user table) initialized');
        Quiz_question.count().then(function(count) {
          if (count === 0) {
            Quiz_question.bulkCreate(
              [{
                questions: 'What is == in JavaScript?',
                correct_answer: 'Оператор рівності',
                complexity: 'Simple',
                UserId: 2
              }, {
                questions: 'What is != in JavaScript??',
                correct_answer: 'Оператор нерівності',
                complexity: 'Complicated',
                UserId: 2
              }]
              // TODO add other questions
            ).then(function() {
              console.log('Database (quiz table) initialized')
            });
          };
        });
      });
    };
  });
});
