# Antarest
Simple REST factory with mongoosejs. Antarest will simply generate your GET, POST, PATCH, DELETE rest endpoint and other functionality without pain.

__v0.1.0__: 
- Only support mongoosejs, highly-coupled inside Antarest. 
- PUT not currently supported

## Installation
```npm install antarest```

## Usage
``` javascript
antarest(MONGODB_URI, MONGOOSE_OPTIONS, ARRAY_OF_SERVICE_OBJ)
```

`MONGODB_URI`: Your database URI

`MONGOOSE_OPTIONS`: mongoose.connect() object config

`ARRAY_OF_SERVICE_OBJ`: Your service object

``` javascript
[
  {
    path: '/abc', // ROOT_URI/abc
    model: MONGOOSE_MODEL
  },
  ...
]
```

Above usage will return express object and can be directly used with app.use()

``` javascript
var myRest = antarest(MONGODB_URI, MONGOOSE_OPTIONS, ARRAY_OF_SERVICE_OBJ)

app.use(myRest)
```

## Example
Simple usage
``` javascript
var express = require('express')
var bodyParser = require('body-parser')

var antarest = require('antarest')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var Cat = mongoose.model('Cat', new mongoose.Schema({ name: String, age: Number, birth: Date }))

app.use(
  antarest(
    'mongodb://localhost:27017/animals', 
    { promiseLibrary: global.Promise }, 
    [
      { path: '/cat', model: Cat }
    ]
  )
)

app.listen(6969)
```

Every antarest instantiation will generate this endpoint for you:
### localhost:6969/cat/ - GET
Endpoint for get all doc from database.

Example, return all docs:
```
localhost:6969/cat
```
result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "_id": "5a98fb2dde626515810b8807",
      "name": "Thomas The Cat",
      "birth": 2018-01-01T00:00:00.000Z,
      "__v": 0
    },
    {
      "_id": "5a9908746df866266c758216",
      "name": "Fluff The Cat",
      "age": 1.5,
      "birth": "2016-12-01T00:00:00.000Z",
      "__v": 0
    },
    {
      "_id": "5a9908746df866266c758216",
      "name": "Muff The Cat",
      "age": 1.5,
      "birth": "2016-12-01T00:00:00.000Z",
      "__v": 0
    }
  ],
  "msg": "Return all payload that match filter",
  "query": {}
}
```

Example with query string:
```
localhost:6969/cat?name=Thomas+The+Cat
```
Result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "_id": "5a98fb2dde626515810b8807",
      "name": "Thomas The Cat",
      "birth": 2018-01-01T00:00:00.000Z,
      "__v": 0
    }
  ],
  "msg": "Return all payload that match filter",
  "query": {
    "name": "Thomas The Cat"
  }
}
```

For now, the query key must be same with the field in the mongoose schema.

Query string only capable to do equal operator. For more complex operation refer to /search

### localhost:6969/cat/search - POST
Endpoint to get all docs given conditions in body request.

__Request body must be in 'application/json' format.__
Set 'Content-Type' header to application/json

`Content-Type: application/json`

Example:

`localhost:6969/cat`

`Content-Type: application/json`

``` json
{ "name": { "$eq": "Thomas The Cat" } }
```

The body request object refer to this mongodb documentation [https://docs.mongodb.com/manual/reference/operator/query/](). You can build your complex query based on the documentation and send them as json to get your docs properly.

Result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "_id": "5a98fb2dde626515810b8807",
      "name": "Thomas The Cat",
      "birth": 2018-01-01T00:00:00.000Z,
      "__v": 0
    }
  ],
  "msg": "Return all payload that match filter",
  "query": {
      "name": {
        "$eq": "Thomas The Cat"
      }
    }
}
```


### localhost:6969/cat/aggregate - POST
Endpoint to make aggregation operation.

Example:

### localhost:6969/cat/ - POST
fasdfasd

### localhost:6969/cat/ - PATCH
fasdfasd

### localhost:6969/cat/ - DELETE
fasdfasd

## Options
blablabla

## License
MIT