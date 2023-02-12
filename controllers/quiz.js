let models = require('../models/models.js');
let url = require('url');

exports.ownershipRequired = function(req, res, next) {
  let objQuizOwner = req.quiz.UserId;
  let logUser = req.session.user.id;
  let isAdmin = req.session.user.isAdmin;

  if (isAdmin || objQuizOwner === logUser) {
    next();
  } else {
    res.redirect('/');
  }
};

exports.post = async function(req, res, next) {

  let userQuiz;

  userQuiz = await models.User_quiz.findOne({
    where: {
      id: req.body.quizId
    }
  });

  let answers;
  if(JSON.parse(userQuiz.answers) === "{}") answers = new Object(); else answers = JSON.parse(userQuiz.answers);
  const answerValues = Object.values(answers);
  const answersLength = answerValues.length;
  const questionsArray = JSON.parse(userQuiz.questions);

  if (answersLength === questionsArray.length)
  {
    let correctAnswers = answerValues.filter((item) =>  item === true).length;
    let percentageOfCorrectAnswers = (correctAnswers/(answersLength + 1)) * 100;

    let quizResult = {
      result: percentageOfCorrectAnswers + "%"
    }

    res.status(201).send(quizResult).end();
    return;
  }
  else
  {
    let currentQuizId = questionsArray[answersLength]
    let isAnswerCorrect = models.Quiz_question.findOne({
      where: {
        id: currentQuizId
      }
    }).then(function(quiz) {
      return quiz.correct_answer === req.body.answear;
    }).catch(function(error) {
      next(error)
    });
  
    answers[currentQuizId] = isAnswerCorrect;
    answerValues.push(isAnswerCorrect); 

    console.log(answerValues);
    await models.User_quiz.update({
      answers : answers
    },
    {
      where: {
        id: req.body.quizId
      }
    });

    if (answersLength + 1 === questionsArray.length)
    {
      let correctAnswers = answerValues.filter((item) =>  item === true).length;
      let percentageOfCorrectAnswers = (correctAnswers/(answersLength + 1)) * 100;
  
      let quizResult = {
        result: percentageOfCorrectAnswers + "%"
      }
  
      res.status(201).send(quizResult).end();
      return;
    }
  }
  
  let nextQuizId = questionsArray[answersLength + 1];
  await models.Quiz_question.findOne({
    where: {
      id: nextQuizId
    }
  }).then(function(quiz) {
    let answers = [quiz.incorrect_answers, quiz.correct_answer];
    console.log(answers);
    let isCompleted
    if (answersLength + 1 === questionsArray.length) isCompleted = "Yes"; else isCompleted = "No";

    let response = {
      totalQuestionsNumber: questionsArray.length,
      questionNumber: answersLength + 1,
      startTime: userQuiz.start_time,
      questionsWithOptions: {
        question: quiz.question,
        isCompleted: isCompleted,
        answers: answers,
      }
    }
    res.send(response);
  }).catch(function(error) {
    next(error)
  });
}

// Autoload :userId
exports.get = async function(req, res, next) {

  let user_id = Number(req.params.userId);

  let lastUserQuiz;

  lastUserQuiz = await models.User_quiz.findOne({
    where: {
      UserId: user_id
    },
    order: [['createdAt', 'DESC' ]]
  })

let complexity;

if (lastUserQuiz == null)
{
  complexity = "simple";
}
else
{
  const answersObj = JSON.parse(lastUserQuiz.answers);
  const questionsArray = JSON.parse(lastUserQuiz.questions);
  let answers = Object.values(answersObj);
  let correctAnswers = answers.filter((item) =>  item === true).length;
  let percentageOfCorrectAnswers = (correctAnswers/questionsArray.length) * 100;

  if (percentageOfCorrectAnswers < 70)
  {
    complexity = lastUserQuiz.complexity;
  }
  else
  {
    complexity = ComplexityNextStateMachine(lastUserQuiz.complexity);
  }
}

let quizQuestionIds = [];

await models.Quiz_question.findAll({
  attributes: [
    'id'
  ],
  where: {
    complexity: complexity
  },
  raw: true,
}).then(function(questionIds){
  console.log(questionIds);
  while(quizQuestionIds.length < 5) // number of questions
  {
      let quizQuestionId = Math.floor(Math.random() * questionIds.length);
      console.log(quizQuestionId);
      let questionId = questionIds[quizQuestionId].id;

      if(!quizQuestionIds.includes(questionId)) 
      {
        quizQuestionIds.push(questionId);
     }
  }
});

let userQuizModel = {
  user_id: user_id,
  questions: quizQuestionIds,
  answers: JSON.stringify(new Object()),
  complexity: complexity,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  start_time: Date.now()
}
let userQuiz = models.User_quiz.build(userQuizModel);

await userQuiz.save()
  .then(() => {
    console.log('User quiz saved successfully');
  })
  .catch(function(error) {
    next(error)
  });

await models.Quiz_question.findOne({
    where: {
      id: quizQuestionIds[0]
    }
  }).then(function(quiz) {
    let answers = [...quiz.incorrect_answers.split(", "), quiz.correct_answer];
    let response = {
        totalQuestionsNumber: userQuizModel.questions.length,
        questionNumber: 1,
        startTime: userQuizModel.start_time,
        questionsWithOptions: {
          question: quiz.question,
          isCompleted: "No",
          answers: answers,
        }
      }

    // res.send(response);
    res.render('quizzes/new', {
      page: 'quiz-new',
      response: response,
      errors: []});
  }).catch(function(error) {
    next(error)
  });
};

function ComplexityNextStateMachine(currentState) {

  let nextState;

  if (currentState === "simple")
  {
    nextState = "normal";
  } 
  else if (currentState === "normal")
  {
    nextState = "complicated";
  }
  else if (currentState === "complicated")
  {
    nextState = "complicated";
  }

  return nextState;
}

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz_question.findOne({
    where: {
      id: Number(quizId)
    }
  }).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else {
      next(new Error('Nonexistent quizId=' + quizId))
    }
  }).catch(function(error) {
    next(error)
  });
};

// GET /quizzes
exports.index = function(req, res, next) {
  let options = {};
  let query = url.parse(req.url, true).query;

  if (JSON.stringify(query) !== '{}' && query.search !== '') {
    options = {
      where: ['question like ?', '%' + query.search.replace(/\s+/g, '%') + '%']
    };
    console.log(options);
  }

  let _page = 'quiz-index';
  if (req.user) {
    options.where = {
      UserId: req.user.id
    }
    _page = 'quiz-index-user';
  }

  let simple_questions = 0;
  let normal_questions = 0;
  let complicated_questions = 0;
  let total_questions;

  models.Quiz_question.findAll().then(function(quiz_questions) {
    for (const key in quiz_questions) {
      let complexity = quiz_questions[key].complexity
      if (complexity === "simple"){
        simple_questions += 1
      } else if (complexity === "normal"){
        normal_questions += 1
      } else if (complexity === "complicated"){
        complicated_questions += 1
      }
      console.log("simple_questions = " + simple_questions)
      console.log("normal_questions = " + normal_questions)
      console.log("complicated_questions = " + complicated_questions)
    }
     total_questions = simple_questions + normal_questions + complicated_questions;
    });

  models.Quiz_question.findAll(options).then(
    function(quizzes) {
      res.render('quizzes/new.ejs', {
        page: _page,
        quizzes: quizzes,
        total_questions: total_questions,
        simple_questions: simple_questions,
        normal_questions: normal_questions,
        complicated_questions: complicated_questions,
        errors: []
      });
  }).catch(function(error) {
    next(error)
  });
};

// GET /quizzes/:id
exports.show = function(req, res, next) {
  res.render('quizzes/show', {
    page: 'quiz-show',
    quiz: req.quiz,
    errors: []
  });
};

// GET /quizzes/:id/answer
exports.correct_answer = function(req, res, next) {
  let result = 'Не правильно';
  if (req.query.correct_answer === req.quiz.correct_answer) {
    result = 'Правильно';
  }
  res.render(
    'quizzes/correct_answer', {
      page: 'quiz-correct_answer',
      quiz: req.quiz,
      correct_answer: result,
      errors: []
    }
  );
};

// GET /quizzes/new
exports.new = function(req, res, next) {
  let quiz = models.Quiz_question.build({
    questions: 'Question text.',
    correct_answer: 'Answer text.'
  });

  res.render('quizzes/new', {
    page: 'quiz-new',
    quiz: quiz,
    errors: []
  });
};

// POST /quizzes/create
exports.create = function(req, res, next) {

  req.body.quiz.UserId = req.session.user.id;
  if (req.files.image) {
    req.body.quiz.image = req.files.image.name;
  }

  let quiz = models.Quiz_question.build(req.body.quiz);

  quiz
    .validate()
    .then(
      function(err) {
        if (err) {
          res.render('quizzes/new', {
            page: 'quiz-new',
            quiz: quiz,
            errors: err.errors
          });
        } else {
          quiz
            .save({
              fields: ['questions', 'correct_answer', 'complexity', 'image']
            })
            .then(function() {
              res.redirect('/quizzes')
            });
        }
      }
    ).catch(function(error) {
      next(error)
  });
};
