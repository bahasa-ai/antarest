var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var antarest = require('./lib/antarest')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var Cat = new mongoose.Schema({ name: String, weight: Number, birth: Date })
var Dog = new mongoose.Schema({ name: String, weight: Number, birth: Date })

app.use(
  antarest(
    'mongodb://localhost:27017/cats', 
    { promiseLibrary: global.Promise }, 
    [
      { 
        path: '/cat', 
        model: {
          name: 'Cat',
          schema: Cat,
          collection: 'cats' 
        }
      }
    ]
  )
)

app.use(
  antarest(
    'mongodb://localhost:27017/dogs', 
    { promiseLibrary: global.Promise }, 
    [
      { 
        path: '/dog', 
        model: {
          name: 'Dog',
          schema: Dog,
          collection: 'dogs'
        }
      }
    ], 
    { NotFoundHandler: true }
  )
)

app.listen(6969)