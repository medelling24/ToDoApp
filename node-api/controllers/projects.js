var mongoose = require('mongoose');
var Projects  = mongoose.model('projects');

//GET - Return all tvshows in the DB
exports.findAllProjects = function(req, res) {
    Projects.find(function(err, projects) {
        if(err) res.send(500, err.message);

        console.log('GET /projects');
        res.status(200).jsonp(projects);
    });
};


exports.addProjects = function(req, res) {
    console.log('POST');
    var project = new Projects({
        title:    req.body.title,
        tasks:     req.body.tasks
    });

    Projects.findOne({title : project.title}, function (err, update_project) {
        if (update_project) { //if exists update
            console.log(project.tasks);

            update_project.title=project.title;
            update_project.tasks=project.tasks;

            update_project.save(function(err) {
                if(err) return res.status(500).send( err.message);

                res.status(200).jsonp(update_project);
            });
        }
        else{ //else create
            project.save(function(err, project) {
                if(err) return res.status(500).send( err.message);

                res.status(200).jsonp(project);
            });
        }
    });


};