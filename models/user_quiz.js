let {User} = require("./models");

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'User_quiz', {
      start_time: {
        type: DataTypes.DATE,
        validate: {
          notEmpty: {
            msg: 'Missing date'
          }
        }
      },
      UserId: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: {
            msg: 'Missing user_id'
          }
        }
      },
      questions: {
        type: DataTypes.JSON,
      },
      answers: {
        type: DataTypes.JSON,
      },
      complexity: {
        type: DataTypes.ENUM('simple', 'normal', 'complicated'),
        defaultValue: 'simple',
        validate: {
          notEmpty: {
            msg: 'Missing complexity'
          }
        }
      }
    }
  );
}
