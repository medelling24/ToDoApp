var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    mongoose        = require('mongoose');


// Connection to DB
mongoose.connect('mongodb://localhost/projects', function(err, res) {
    if(err) throw err;
    console.log('Connected to Database');
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

// Import Models and controllers
var models     = require('./models/projects')(app, mongoose);
var Projects = require('./controllers/projects');


// API routes
var projects = express.Router();

projects.route('/projects')
    .get(Projects.findAllProjects)
    .post(Projects.addProjects);


app.use('/api', projects);

// Start server
app.listen(3000, function() {
    console.log("Node server running on http://localhost:3000");
});