let express = require('express'),
  router = express.Router();
  multer = require('multer')

const questionController = require('../controllers/question');
const quizController = require('../controllers/quiz');
const sessionController = require('../controllers/session');
const userController = require('../controllers/user');
const statisticsController = require('../controllers/statistics');

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

// load values
router.param('quizId', quizController.load);
router.param('userId', userController.load);

// quizzes routes
router.get('/user/:userId(\\d+)/quizzes', sessionController.loginRequired, quizController.get);
router.post('/quizzes/create', sessionController.loginRequired, quizController.create);
// router.get('/quizzes/new', sessionController.loginRequired, quizController.index);
// router.get('/quiz/:userId(\\d+)', sessionController.loginRequired, quizController.get);
// router.post('/quiz', sessionController.loginRequired, quizController.post);

// stats
router.get('/statistics', sessionController.loginRequired, statisticsController.calculate);

// auth
router.get('/login', sessionController.new);
router.post('/login', sessionController.create);
router.get('/logout', sessionController.destroy);

// user
router.get('/user', userController.new);
router.post('/user', userController.create);
router.get('/user/:userId(\\d+)/edit', sessionController.loginRequired, userController.ownershipRequired, userController.edit);
router.put('/user/:userId(\\d+)', sessionController.loginRequired, userController.ownershipRequired, userController.update);
router.delete('/user/:userId(\\d+)', sessionController.loginRequired, userController.ownershipRequired, userController.destroy);

// questions
router.get('/questions', sessionController.loginRequired, questionController.adminRequired, questionController.index);
router.get('/questions/:quizId(\\d+)/edit', sessionController.loginRequired, questionController.adminRequired, questionController.edit);
router.put('/questions/:quizId(\\d+)', sessionController.loginRequired, questionController.adminRequired, questionController.update);
router.delete('/questions/:quizId(\\d+)', sessionController.loginRequired, questionController.adminRequired, questionController.destroy);

module.exports = router;
