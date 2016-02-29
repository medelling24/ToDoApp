angular.module('to_do', ['ionic'])

    .factory('Projects', function () {

        var ProjectFactory = {
            all: function ($http) {

                //window.localStorage.clear();

                //Get local storage
                var projectString = window.localStorage['projects'];

                var localProjects = angular.fromJson(projectString);

                //get server storage
                return $http.get("http://localhost:3000/api/projects")
                    .then(function (response) {
                        var serverProjects = response.data;
                        var mergeProjects = [];

                        if (localProjects && serverProjects)
                            mergeProjects = arrayUnique(serverProjects.concat(localProjects));
                        else if(serverProjects)
                            mergeProjects = serverProjects;

                        if(mergeProjects.length>0)
                            ProjectFactory.save(mergeProjects, $http);

                        return mergeProjects;
                    });
            },
            getLastActive: function () {
                return parseInt(window.localStorage['lastActiveProject']) || 0;
            },
            setLastActive: function (index) {
                window.localStorage['lastActiveProject'] = index;
            },
            newProject: function (projectTitle) {
                return {
                    title: projectTitle,
                    tasks: []
                };
            },
            save: function (projects, $http) {
                window.localStorage['projects'] = angular.toJson(projects);

                //Should be only 1 call
                for (var i = 0; i < projects.length; i++) {
                    $http.post("http://localhost:3000/api/projects", angular.toJson(projects[i]));
                }

            }

        }

        return ProjectFactory;
    })

    .controller('TodoCtrl', function ($scope, $http, $timeout, $ionicModal, $ionicSideMenuDelegate, $ionicPopup, Projects) {



        var createProject = function (projectTitle) {
            var newProject = Projects.newProject(projectTitle);
            $scope.projects.push(newProject);
            Projects.save($scope.projects, $http);
            $scope.selectProject(newProject, $scope.projects.length - 1);
            $scope.projectModal.hide();

        }

        $scope.showProjectModal = function () {
            $scope.projectModal.show();
        };

        $scope.newProject = function (project) {
            var projectTitle = project.title;

            if (arrayObjectIndexOf($scope.projects, projectTitle, "title") == -1) {
                if (projectTitle) {
                    createProject(projectTitle);
                }
                project.title = "";
            }
            else {
                $scope.showAlert("Project Already Exists", "Please create another project");
            }
        };

        $scope.selectProject = function (project, index) {
            $scope.activeProject = project;
            Projects.setLastActive(index);
            $ionicSideMenuDelegate.toggleRight();
        };

        $scope.checkTask = function (task) {
            task.complete = !task.complete;
            Projects.save($scope.projects, $http);
        };

        // Create  modal
        $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope
        });
        $ionicModal.fromTemplateUrl('new-project.html', function (modal) {
            $scope.projectModal = modal;
        }, {
            scope: $scope
        });

        $scope.createTask = function (task) {

            var taskTitle = task.title;

            if (arrayObjectIndexOf($scope.activeProject.tasks, taskTitle, "title") == -1) {
                if (taskTitle) {
                    $scope.activeProject.tasks.push({
                        title: task.title,
                        complete: false,
                        owner: task.owner
                    });
                    $scope.taskModal.hide();

                    Projects.save($scope.projects, $http);
                }

                task.title = "";
                task.owner = "";
            }
            else {
                $scope.showAlert("Task Already Exists", "Please create another task");
            }


        };

        $scope.getProjects = function () {
            Projects.all($http)
                .then(function (message) {
                    $scope.projects = message;
                    $scope.activeProject = $scope.projects[Projects.getLastActive()];
                })
        }

        $scope.newTask = function () {
            $scope.taskModal.show();
        };

        $scope.closeNewTask = function () {
            $scope.taskModal.hide();
        }

        $scope.closeNewProject = function () {
            $scope.projectModal.hide();
        }

        $scope.toggleProjects = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        // An alert dialog
        $scope.showAlert = function (title, message) {
            $ionicPopup.alert({
                title: title,
                template: message
            });
        };

        $scope.getProjects();

    });


function arrayObjectIndexOf(myArray, searchTerm, property) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i].title === a[j].title)
                a.splice(j--, 1);
        }
    }

    return a;
}