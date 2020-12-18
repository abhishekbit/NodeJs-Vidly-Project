const winston = require('winston')
const Joi = require('joi')//validating input
Joi.objectId = require('joi-objectid')(Joi)
const express = require('express')
const app = express()


require('./startup/logging')()
require('./startup/routes')(app)
require('./startup/prod')(app)

require('./startup/db')()
require('./startup/config')()
//require('./startup/validation')()



const port=process.env.PORT || 3000; 
const server = app.listen(port,()=>winston.info(`Listening on port ${port}...`))

module.exports = server