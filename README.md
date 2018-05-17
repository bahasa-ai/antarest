# Antarest
Simple REST factory with mongoosejs. Antarest will simply generate your GET, POST, PATCH, DELETE rest endpoint and other functionality without pain.

__v0.1.0__: 
- Only support mongoosejs, highly-coupled inside Antarest. 
- PUT not currently supported

__v0.2.0__: 
- Bug fixes

__v0.3.0__: 
- Support converting ObjectId string to ObjectId type as a aggregate conditions

## Installation
```npm install antarest```

## Usage
``` javascript
antarest(MONGODB_URI, MONGOOSE_OPTIONS, ARRAY_OF_SERVICE_OBJ, OPTIONS)
```

`MONGODB_URI`: Your database URI

`MONGOOSE_OPTIONS`: mongoose.connect() object config

`ARRAY_OF_SERVICE_OBJ`: Your service object

`OPTIONS`: Antarest option

``` javascript
[
  { 
    path: '/cat', // path used as endpoint
    model: {
      name: 'Cat', // model name
      schema: Cat, // mongoose schema
      collection: 'cats' // collections name for model
    }
  }
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
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var antarest = require('antarest')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var Cat = new mongoose.Schema({ name: String, weight: Number, birth: Date })

app.use(
  antarest(
    'mongodb://localhost:27017/animals', 
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

app.listen(6969)
```

Every antarest instantiation will generate this endpoint for you:
### __localhost:6969/cat/ - GET__
Endpoint for get all doc from database.

Example, return all docs:
```
GET localhost:6969/cat
```
result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "_id": "5a98fb2dde626515810b8807",
      "name": "Thomas The Cat",
      "weight": 2,
      "birth": "2018-01-01T00:00:00.000Z",
      "__v": 0
    },
    {
      "_id": "5a98fb24de626515810b8806",
      "name": "Fluff The Cat",
      "weight": 5,
      "birth": "2016-12-01T00:00:00.000Z",
      "__v": 0
    },
    {
      "_id": "5a9908746df866266c758216",
      "name": "Muff The Cat",
      "weight": 2,
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
GET localhost:6969/cat?name=Thomas+The+Cat
```
Result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "_id": "5a98fb2dde626515810b8807",
      "name": "Thomas The Cat",
      "weight": 2,
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

### __localhost:6969/cat/search - POST__
Endpoint to get all docs given conditions in body request.

__Request body must be in 'application/json' format.__
Set 'Content-Type' header to application/json

`Content-Type: application/json`

Example:

```
POST localhost:6969/cat
```

```
Content-Type: application/json
```

``` json
{ "name": { "$eq": "Thomas The Cat" } }
```

The body request object refer to this mongodb documentation [https://docs.mongodb.com/manual/reference/operator/query/](). You can build your complex query, including limit and grouping, based on the documentation and send them as json to get your docs properly. Make sure that your conditions query match with your MongoDB version running.

Result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "_id": "5a98fb2dde626515810b8807",
      "name": "Thomas The Cat",
      "weight": 2,
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

### __localhost:6969/cat/aggregate - POST__
Endpoint to make aggregation operation.

__Request body must be in 'application/json' format.__
Set 'Content-Type' header to application/json

`Content-Type: application/json`

Example:

```
POST localhost:6969/cat
```

```
Content-Type: application/json
```

``` json
[
	{ 
		"$match": {
			"weight": {"$gt": 3}
		}
	},	
	{
		"$group": { 
      "_id": null, 
      "fat_cat": {"$sum": 1}
    }
	}
]
```

The body request aggregation conditions refer to this mongodb documentation [https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/](). You can build your complex aggregation pipeline based on the documentation and send them as json to get your docs properly. Make sure that your aggregation pipeline conditions match with your MongoDB version running.

Result:
``` json
{
  "status": 200,
  "payload": [
    {
      "_id": "null",
      "fat_cat": 1
    }
  ],
  "msg": "Return all payload that match filter",
  "query": [
    { 
      "$match": {
        "weight": {"$gt": 3}
      }
    },	
    {
      "$group": { 
        "_id": null, 
        "fat_cat": {"$sum": 1}
      }
    }
  ]
}
```
^ using MongoDB v3.2

### __localhost:6969/cat/ - POST__
Create new doc.

Example:
```
POST localhost:6969/cat
```

``` json
{
  "name": "Puff The Cat",
  "weight": 2,
  "birth": "2018-01-01T00:00:00.000Z"
}
```

Result:
``` json
{
    "status": 201,
    "payload": {
        "name": "Puff The Cat",
        "weight": 2,
        "birth": "2018-01-01T00:00:00.000Z",
        "_id": "5a9daff5b3529a1b416137c2",
        "__v": 0
    },
    "msg": "Created"
}
```

### __localhost:6969/cat/ - PATCH__
Patch __single or multiple__ docs given conditions

Example:
```
PATCH localhost:6969/cat
```

conditions
``` json
{
  "conditions": { "_id": { "$eq": "5a9908746df866266c758216" } },
  "patch": { "weight": 3 }
}
```

Result:
``` json
{
  "status": 200,
  "payload": [
    {
      "_id": "5a9908746df866266c758216",
      "name": "Muff The Cat",
      "weight": 3,
      "birth": "2016-12-01T00:00:00.000Z",
      "__v": 0
    }
  ],
  "msg": "All docs updated",
  "query": {
    "_id": "5a9908746df866266c758216"
  }
}
```

Conditions property on body refer to MongoDB query [https://docs.mongodb.com/manual/reference/operator/query/]()

__WARNING__: It is important for you to make sure you pass your conditions. If you pass an empty object all docs will be updated.

### __localhost:6969/cat/ - DELETE__
Delete __single or multiple__ docs given conditions

Example:
```
DELETE localhost:6969/cat
```

conditions
``` json
{
  "conditions": { "weight": { "$gt": 3 } }  
}
```

Result:
``` json
{
  "status": 200,
  "payload": [
    {
      "_id": "5a9908746df866266c758216",
      "name": "Fluff The Cat",
      "weight": 5,
      "birth": "2016-12-01T00:00:00.000Z",
      "__v": 0
    }
  ],
  "msg": "All docs match deleted",
  "query": {
    "weight": {
      "$gt": 3
    }
  }
}
```

__WARNING__: It is important for you to make sure you pass your conditions. If you pass an empty object all docs will be deleted.

## Options
`NotFoundHandler`: __false__, Add 404 handler

## Multiple Antarest Use
You can using antarest with multiple mongoose connection as you want.

Example:
``` javascript
...
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
...
```

Antarest will separate the connection so you will use all your mongoose database connection.

## License
MIT