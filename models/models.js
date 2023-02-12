const path = require('path');
// TODO
let url = "sqlite://:@:/".match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
let DB_name = (url[6] || null);
let user = (url[2] || null);
let pwd = (url[3] || null);
let protocol = (url[1] || null);
let dialect = (url[1] || null);
let port = (url[5] || null);
let host = (url[4] || null);
// TODO
// let storage = process.env.DATABASE_STORAGE;
let storage = 'node-quiz.sqlite';
let Sequelize = require('sequelize');
let quiz_questions_data = require("./quiz_question.json");
let user_quiz_data = require("./user_quiz.json");
const sequelize = new Sequelize(DB_name, user, pwd, {
  dialect: protocol,
  protocol: protocol,
  port: port,
  host: host,
  storage: storage, // only SQLite (.env)
  omitNull: true // only Postgres
});

// import models
const Quiz_question = require(path.join(__dirname, 'quiz_question'))(sequelize, Sequelize.DataTypes)
const User_quiz = require(path.join(__dirname, 'user_quiz'))(sequelize, Sequelize.DataTypes)
const User = require(path.join(__dirname, 'user'))(sequelize, Sequelize.DataTypes)

// DB relationships
// User_quiz.belongsTo(User);
User.hasMany(User_quiz);

exports.Quiz_question = Quiz_question;
exports.User_quiz = User_quiz
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
        },
        {
          username: 'user111',
          password: 'user'
        }]
      ).then(function() {
        User_quiz.count().then(function(count) {
          if (count === 0) {
            User_quiz.bulkCreate(
              user_quiz_data
            ).then(function() {
              console.debug('Database (User_quiz table) initialized')
            });
          }
        });
      }).then(function() {
        Quiz_question.count().then(function(count) {
          if (count === 0) {
            Quiz_question.bulkCreate(
              quiz_questions_data
            ).then(function() {
              console.debug('Database (quiz table) initialized')
            });
          }
        });
      });
    }
  });
});
