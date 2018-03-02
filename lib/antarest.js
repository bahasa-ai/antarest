var express = require('express')
var mongoose = require('mongoose')
var RouterFactory = require('./RouterFactory')

/**
 * @param {Array} services - Array of services {path: String, model: mongoose.Model}
 * @param {{ [key]: value }} options 
 */
function Antarest(services, options) {  
  var app = express()  
  
  /** Options
   *  
   * [NotFoundHandler]: false
  */
  var Options = (typeof options !== 'object' || options.constructor.name !== 'Object') ? {} : options  

  services.forEach(s => {
    // Check if model is a truly mongoose model
    if (!s.model.base instanceof mongoose.Mongoose) {
      throw 'First parameter must be a Mongoose model (v0.1.0)'      
    }

    app.use(s.path, RouterFactory(s.model))
  })

  Options.NotFoundHandler && app.use(function(req, res) { res.send({ status: 404, msg: 'Service not found' }) })
  
  return app
}

module.exports = Antarest