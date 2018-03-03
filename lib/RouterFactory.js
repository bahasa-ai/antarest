var express = require('express')
var mongoose = require('mongoose')

function Router(model) {
  var router = express.Router()
  var Model = model

  var _find = function(conditions) {
    return Model.find(conditions).exec()
      .then(function(docs) {        
        const docsIsEmpty = docs.length === 0        
        
        return {
          status: (!docsIsEmpty) ? 200 : 404, 
          payload: (!docsIsEmpty) ? docs : [],
          msg: (!docsIsEmpty) ? 'Return all payload that match filter' : 'No docs found', 
          query: conditions 
        }            
      })
      .catch(function(err) {
        return { status: 400, msg: err, query: conditions }
      })
  }

  /**
   * GET - /[model]/
   * Get all docs or single docs given filter
   */
  router.get('/', function(req, res, next) {
    var conditions = {}

    Object.keys(req.query).map(q => conditions[q] = req.query[q])    
    
    _find(conditions).then(r => res.send(r))
  })  

  /**
   * POST - /[model]/search
   * Get all docs given the condition from body
   */
  router.post('/search', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      res.send({ status: 406, msg: 'Not Acceptable'})
    }

    var conditions = req.body || {}

    _find(conditions).then(r => res.send(r))
  })

  /**
   * POST - /[model]/aggregate
   * Aggregate docs given conditions
   */
  router.post('/aggregate', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      res.send({ status: 406, msg: 'Not Acceptable'})
    }

    var conditions = req.body || []

    Model.aggregate(conditions).exec()
      .then(function(result) { return res.send({ status: (result.length > 0) ? 200 : 404, payload: result, msg: (result.length > 0) ? 'Return all aggregated payload that match filter' : 'No docs found', query: conditions }) })
      .catch(function(err) { return res.send({ status: 400, msg: err }) })
  })

  /**
   * POST - /[model]/
   * Create new data
   * Body from user must be in the same format with table Schema
   */
  router.post('/', function(req, res, next) {
    var newDoc = new Model(req.body)

    newDoc.save()
      .then(function(doc) { return res.send({ status: 201, payload: doc, msg: 'Created' }) })  
      .catch(function(err) { return res.send({ status: 400, msg: err }) })
  })

  /**
   * DELETE - /[model]/
   * Hard-delete agent data given query
   */
  router.delete('/', function(req, res, next) {
    var conditions = {}

    Object.keys(req.query).map(q => conditions[q] = req.query[q])

    Model.findOneAndRemove(conditions).exec()
      .then(function(doc) {
        return res.send({ status: (doc) ? 200 : 404, payload: (doc) ? doc : {}, msg: (doc) ? 'Doc updated - DELETE' : 'Doc not found' })
      })
      .catch(function(err) {
        return res.send({ status: 400, msg: err })
      })
  })

  /**
   * PATCH - /[model]/
   * Update data given query
   * Body from user must be in the same format with table Schema
   */
  router.patch('/', function(req, res, next) { 
    var conditions = {}

    Object.keys(req.query).map(q => conditions[q] = req.query[q])

    Model.findOneAndUpdate(conditions, req.body, { new: true }).exec()
      .then(function(doc) {
        return res.send({ status: (doc) ? 200 : 404, payload: (doc) ? doc : {}, msg: (doc) ? 'Doc updated - PATCH' : 'Doc not found' })
      })
      .catch(function(err) {
        return res.send({ status: 400, msg: err })
      })
  })

  return router
}

module.exports = Router
