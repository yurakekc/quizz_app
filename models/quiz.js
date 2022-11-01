module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Quiz', {
      question: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Missing question'
          }
        }
      },
      answer: {
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