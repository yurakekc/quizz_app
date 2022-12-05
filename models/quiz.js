module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Quiz_question', {
      question: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Missing question'
          }
        }
      },
      correct_answer: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Missing answer'
          }
        }
      },
      image: {
        type: DataTypes.STRING
      },
      incorrect_answers: {
        type: DataTypes.JSON
      },
      complexity: {
        type: DataTypes.STRING
      }
    }
  );
}
   