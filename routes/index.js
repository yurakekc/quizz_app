var express = require('express'),
  multer = require('multer'),
  router = express.Router();

var questionController = require('../controllers/question');
var quizController = require('../controllers/quiz');
var sessionController = require('../controllers/session');
var userController = require('../controllers/user');
var statisticsController = require('../controllers/statistics');

router.get('/', function(req, res) {
  res.render('index', {
    page: 'home',
    title: 'node-quiz',
    errors: []
  });
});

router.get('/author', function(req, res) {
  res.render('author', {
    page: 'about',
    errors: []
  });
});

router.get('/statistics', statisticsController.calculate);

router.param('quizId', quizController.load);
router.param('userId', userController.load);

router.get('/login', sessionController.new);
router.post('/login', sessionController.create);
router.get('/logout', sessionController.destroy);

router.get('/user', userController.new);
router.post('/user', userController.create);
router.get('/user/:userId(\\d+)/edit', sessionController.loginRequired, userController.ownershipRequired, userController.edit);
router.put('/user/:userId(\\d+)', sessionController.loginRequired, userController.ownershipRequired, userController.update);
router.delete('/user/:userId(\\d+)', sessionController.loginRequired, userController.ownershipRequired, userController.destroy);
router.get('/user/:userId(\\d+)/quizzes', quizController.index);


router.get('/questions', sessionController.loginRequired, questionController.adminRequired, questionController.index);
router.get('/quizzes/new', sessionController.loginRequired, quizController.new);
router.post('/quizzes/create', sessionController.loginRequired, multer({
  dest: './public/media/'
}), quizController.create);
router.get('/questions/:quizId(\\d+)/edit', sessionController.loginRequired, questionController.adminRequired, questionController.edit);
router.put('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.ownershipRequired, multer({
  dest: './public/media/'
}), quizController.update);

router.delete('/questions/:quizId(\\d+)', sessionController.loginRequired, questionController.adminRequired, questionController.destroy);

module.exports = router;
