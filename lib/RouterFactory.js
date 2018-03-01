var express = require('express')
var mongoose = require('mongoose')

function extractConditions(queries) {
  var conditions = {}

  Object.keys(queries).map(function(q) {
    const querySplit = q.split('$')      
    conditions[querySplit[0]] = { ['$'+((querySplit[1] === '') ? 'eq' : querySplit[1])]: req.query[q] }
  })

  return conditions
}

function Router(model) {
  var router = express.Router()
  var Model = model

  /**
   * GET - /[model]
   * Get all active docs or single active docs given filter
   */
  router.get('/', function(req, res, next) {
    var conditions = extractConditions(req.query)
    
    Model.find(conditions, function(err, docs) {
      if (err) {
        res.send({ status: 400, msg: err, query: req.query })
      } else {
        const docsIsEmpty = docs.length === 0        
        
        res.send({
          status: (!docsIsEmpty) ? 200 : 404, 
          payload: (!docsIsEmpty) ? docs : [],
          msg: (!docsIsEmpty) ? 'Return all payload that match filter' : 'No docs found', 
          query: req.query 
        })                        
      }        
    })
  })

  /**
   * POST - /[model]
   * Create new data
   * Body from user must be in the same format with table Schema
   */
  router.post('/', function(req, res) {
    var newDoc = new Model(req.body)
    newDoc.save((err) => (err) ? res.send({ status: 400, msg: err }) : res.send({ status: 201, msg: 'Created' }))  
  })

  /**
   * DELETE - /[model]
   * Hard-delete agent data given query
   */
  router.delete('/', function(req, res) {
    var conditions = extractConditions(req.query)

    Model.findOneAndRemove(conditions, function(err, doc) {
      if (err) {
        res.send({ status: 400, msg: err })
      } else {                      
        res.send({ 
          status: (doc) ? 200 : 404, 
          payload: (doc) ? doc : {}, 
          msg: (doc) ? 'Doc updated - DELETE' : 'Doc not found'
        })            
      }        
    })
  })

  /**
   * PATCH - /[model]
   * Update data given query
   * Body from user must be in the same format with table Schema
   */
  router.patch('/', function(req, res) { 
    var conditions = extractConditions(req.query)    

    Model.findOneAndUpdate(
      conditions,
      req.body,
      { new: true },
      function(err, doc) {
        if (err) {
          res.send({ status: 400, msg: err })
        } else {
          res.send({ 
            status: (doc) ? 200 : 404, 
            payload: (doc) ? doc : {}, 
            msg: (doc) ? 'Doc updated - PATCH' : 'Doc not found' 
          })
        }        
      }
    )
  })

  return router
}

module.exports = Router