# A simple quiz app

Try this app at TODO add host here

## Prerequisites
- node.js
- npm package manager
- git

## Installation
Clone this repository and install node modules
```sh
$ git clone https://github.com/nazarlviv07/quizz_app.git
$ cd quizz_app
$ npm install
```

Create a .env file in the root directory with required environment variables
```sh
DATABASE_URL=sqlite://:@:/
DATABASE_STORAGE=node-quiz.sqlite
PASSWORD_ENCRYPTION_KEY=insert_some_random_key_here
```

Start the app
```sh
$ node server.js
```
