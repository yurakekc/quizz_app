let crypto = require('crypto');
// const key = process.env.PASSWORD_ENCRYPTION_KEY;
// TODO
const key = "asdfghjklzxcvbnmqwertyuiop";

module.exports = function(sequelize, DataTypes) {
  let User = sequelize.define(
    'User', {
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Missing username'
          },
          isUnique: function(value, next) {
            let self = this;
            User.findOne({
                where: {
                  username: value
                }
              })
              .then(function(user) {
                if (user && self.id !== user.id) {
                  return next('Username already exists');
                }
                return next();
              })
              .catch(function(err) {
                return next(err);
              });
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Missing password'
          }
        },
        set: function(password) {
          let encrypted = crypto.createHmac('sha1', key).update(password).digest('hex');
          if (password === '') {
            encrypted = '';
          }
          this.setDataValue('password', encrypted);
        }
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
  );
  // Instance method new way to initialize
  // https://stackoverflow.com/questions/43954112/cannot-access-sequelize-instance-methods
  User.prototype.verifyPassword = function(password) {
    let encrypted = crypto.createHmac('sha1', key).update(password).digest('hex');
    return encrypted === this.password;
  }

  return User;
}
