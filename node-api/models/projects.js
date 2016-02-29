var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var Tasks = new Schema({
    title:    { type : String},
    complete:    { type : Boolean},
    owner:    { type : String},

});

var Projects = new Schema({
    title:    { type: String },
    tasks:     [Tasks ]

});

module.exports = mongoose.model('projects', Projects);