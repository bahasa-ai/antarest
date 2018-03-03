var express = require('express')
var mongoose = require('mongoose')
var RouterFactory = require('./RouterFactory')

/**
 * @param {Array} services - Array of services, [{path: String, model: mongoose.Model}]
 * @param {{ [key]: value }} options 
 */
function Antarest(mongoConnectURI, mongoConnectOptions, services, options) {  
  // connect to mongoDB
  mongoose.connect(mongoConnectURI, mongoConnectOptions || {})
  
  var app = express()  
  
  /** Options
   *  
   * [NotFoundHandler]: false
  */
  var Options = (typeof options !== 'object' || options.constructor.name !== 'Object') ? {} : options  

  // define and assign each of service in specification
  services.forEach(s => {
    // Check if model is a truly mongoose model
    if (!s.model.base instanceof mongoose.Mongoose) {
      throw 'First parameter must be a Mongoose model (v0.1.0)'      
    }

    // assign all router to specific path
    app.use(s.path, RouterFactory(s.model))
  })

  // Assign NotFoundHandler to express
  Options.NotFoundHandler && app.use(function(req, res) { res.send({ status: 404, msg: 'Service not found' }) })
  
  return app
}

module.exports = Antarest