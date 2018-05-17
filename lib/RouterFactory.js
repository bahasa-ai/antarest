var express = require('express')
var mongoose = require('mongoose')

var ObjectIdHelper = require('./ObjectIdHelper')

function Router(model) {
  var router = express.Router()
  var Model = model

  /**
   * _find
   * Return all docs match with the conditions
   *
   * @param {*} conditions
   */
  function _find(conditions) {
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
   * GET - /[model_path]/
   * Get all docs or single docs given filter
   */
  router.get('/', function(req, res, next) {
    var conditions = {}

    Object.keys(req.query).map(q => conditions[q] = req.query[q])

    _find(conditions).then(r => res.send(r))
  })

  /**
   * POST - /[model_path]/search
   * Get all docs given the condition from body
   */
  router.post('/search', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    var conditions = req.body || {}

    _find(conditions).then(r => res.send(r))
  })

  /**
   * POST - /[model_path]/aggregate
   * Aggregate docs given conditions
   */
  router.post('/aggregate', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    var conditions = req.body || []

    if (!(conditions instanceof Array)) {
      return res.send({ status: 400, msg: 'Bad Request, request must be an array'})
    }

    var normalizedConditions = []

    // Normalized Query, check ObjectIdHelper.js for more info
    conditions.map(obj => normalizedConditions.push(ObjectIdHelper(obj)))

    Model.aggregate(normalizedConditions).exec()
      .then(function(result) { return res.send({ status: (result.length > 0) ? 200 : 404, payload: result, msg: (result.length > 0) ? 'Return all aggregated payload that match filter' : 'No docs found', query: conditions }) })
      .catch(function(err) { return res.send({ status: 400, msg: err }) })
  })

  /**
   * POST - /[model_path]/
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
   * DELETE - /[model_path]/
   * Hard-delete agent data given query
   */
  router.delete('/', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    // check if body has the correct format to prevent deleting all docs
    if (!req.body.hasOwnProperty('conditions')) {
      return res.send({ status: 400, msg: 'Bad Request' })
    }

    var conditions = req.body.conditions || {}

    // get all matched docs
    Model.find(conditions).exec()
      .then(function(docs) {
        if (docs.length > 0) {
          // Array of Promise when removing docs
          var deletes = docs.map(function(d) {
            return Model.findByIdAndRemove(d._id).exec()
              .then(function(doc) {return doc})
              .catch(function(err) {return Promise.reject(err)})
          })

          Promise.all(deletes)
            .then(function(deleted) { return res.send({ status: 200, payload: deleted, msg: 'All docs match deleted', query: conditions }) })
            .catch(function(err) { return res.send({ status: 400, payload: deletes, msg: 'One or more delete operation failed', query: conditions }) })
        } else {
          return res.send({ status: 404, msg: 'No docs found' })
        }
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
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    // check if body has the correct format to prevent updating all docs
    if (!req.body.hasOwnProperty('conditions') || !req.body.hasOwnProperty('patch')) {
      return res.send({ status: 400, msg: 'Bad Request' })
    }

    var conditions = req.body.conditions || {}

    Model.find(conditions).exec()
      .then(function(docs) {
        if (docs.length > 0) {
          var updates = docs.map(function(d) {
            return Model.findByIdAndUpdate(d._id, { '$set': req.body.patch }, { new: true }).exec()
              .then(function(doc) {return doc})
              .catch(function(err) {return Promise.reject(err)})
          })

          Promise.all(updates)
            .then(function(updated) { return res.send({ status: 200, payload: updated, msg: 'All docs updated', query: conditions }) })
            .catch(function(err) { return res.send({ status: 400, payload: updates, msg: 'One or more update operation failed', query: conditions }) })
        } else {
          return res.send({ status: 404, msg: 'No docs found' })
        }
      })
      .catch(function(err) {
        return res.send({ status: 400, msg: err })
      })
  })

  return router
}

module.exports = Router
