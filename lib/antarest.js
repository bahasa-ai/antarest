var express = require('express')
var mongoose = require('mongoose')
var RouterFactory = require('./RouterFactory')

/**
 * @param {Array} services - Array of services {path: String, model: mongoose.Model}
 * @param {{ [key]: value }} options 
 */
function Antarest(services, options) {  
  var App = express()  
  
  /** Options
   *   
  */
  var Options = (typeof options !== 'object' || options.constructor.name !== 'Object') ? {} : options  

  services.forEach(s => {
    // Check if model is a truly mongoose model
    if (!s.model.base instanceof mongoose.Mongoose) {
      throw 'First parameter must be a Mongoose model (v0.1.0)'      
    }

    App.use(s.path, RouterFactory(s.model))
  })
  
  return App
}

module.exports = Antarest