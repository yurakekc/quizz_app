module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Quiz_question', {
      questions: {
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
      complexity: {
        type: DataTypes.STRING
      }
    }
  );
}
// TODO  DataTypes.ENUM - for answers 
// TODO  rename answer to correct_answer   