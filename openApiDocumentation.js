const { USER_TYPES, REGULAR } = require('./config/constants');

module.exports = {
  openapi: '3.0.1',
  info: {
    version: '1.0.0',
    title: 'Users',
    description: 'JS Quiz API',
    termsOfService: 'http://api_url/terms/',
    contact: {
      name: 'TRIM-11',
      email: 'nazarlviv07@gmail.com',
      url: 'https://lpnu.ua//'
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001/',
      description: 'Local server'
    },
    {
      url: 'https://api_url_testing',
      description: 'Testing server'
    },
    {
      url: 'https://api_url_production',
      description: 'Production server'
    }
  ],
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  tags: [
    {
      name: 'Quiz operations'
    }
  ],
  paths: {
    '/quiz': {
      get: {
        tags: ['Quiz operations'],
        description: 'Get quiz',
        operationId: 'getQuiz',
        parameters: [
          {
            name: 'userId',
            in: 'header',
            schema: {
              $ref: '#/components/schemas/userId'
            },
            required: true,
            description: 'User ID'
          },
        ],
        responses: {
          '200': {
            description: 'Get quiz',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Quiz'
                }
              }
            }
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'companyId is missing',
                  internal_code: 'missing_parameters'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Quiz operations'],
        description: 'Save quiz',
        operationId: 'saveQuiz',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaveQuizDto'
              }
            }
          },
          required: true
        },
        responses: {
          '200': {
            description: 'Save quiz',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Quiz'
                }
              }
            }
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'companyId is missing',
                  internal_code: 'missing_parameters'
                }
              }
            }
          }
        }
      }
    },
    '/users': {
      get: {
        tags: ['User operations'],
        description: 'Get users',
        operationId: 'getUsers',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1
            },
            required: false
          },
          {
            name: 'orderBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc'
            },
            required: false
          }
        ],
        responses: {
          '200': {
            description: 'Users were obtained',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Users'
                }
              }
            }
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'companyId is missing',
                  internal_code: 'missing_parameters'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['User operations'],
        description: 'Create users',
        operationId: 'createUsers',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Users'
              }
            }
          },
          required: true
        },
        responses: {
          '200': {
            description: 'New users were created'
          },
          '400': {
            description: 'Invalid parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'User identificationNumbers 10, 20 already exist',
                  internal_code: 'invalid_parameters'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      identificationNumber: {
        type: 'integer',
        description: 'User identification number',
        example: 1234
      },
      username: {
        type: 'string',
        example: 'raparicio'
      },
      userId: {
        type: 'integer',
        example: 1234
      },
      dateTime: {
        type: 'string',
        format: 'date-time',
        example: '2022-03-20T09:12:28Z'
      },
      userType: {
        type: 'string',
        enum: USER_TYPES,
      },
      questionsWithOptions: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            example: 'Difference between “==” and “===”?'
          },
          isCompleted: {
            type: 'string',
            example: 'Yes/No'
          },
          answers: {
            type: 'array',
            items: {
              type: 'string',
              example: ['no difference', ' == not exists in JS', "=== not exists in JS", "=== is strict equal"]
            },
          },
        }
      },     
      Quiz: {
        type: 'object',
        properties: {
          startTime: {
            $ref: '#/components/schemas/dateTime'
          },
          questionNumber: {
            type: 'integer',
            example: 3,
          },
          totalQuestionsNumber: {
            type: 'integer',
            example: 10,
          },
          questionsWithOptions: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/questionsWithOptions'
            }
          },
        }
      },
      SaveQuizDto: {
        type: 'object',
        properties: {
          quizId: {
            type: 'integer',
            example: 3,
          },
          answear: {
            type: 'string',
            example: "=== is strict equal",
          },
        }
      },
      User: {
        type: 'object',
        properties: {
          identificationNumber: {
            $ref: '#/components/schemas/identificationNumber'
          },
          username: {
            $ref: '#/components/schemas/username'
          },
          userType: {
            $ref: '#/components/schemas/userType'
          }
        }
      },
      Users: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string'
          },
          internal_code: {
            type: 'string'
          }
        }
      }
    },
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key'
      }
    }
  }
};
