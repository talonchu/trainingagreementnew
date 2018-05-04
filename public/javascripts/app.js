var polls = angular.module('polls', ["employeeDirective","employeeControllers","ngRoute",'angularUtils.directives.dirPagination'])//Specifies the Controller
    .config(['$routeProvider', '$httpProvider',function ($routeProvider) {
        $routeProvider.when('/employeelist', {
            templateUrl: '/partials/employeeList.html', controller: "EmployeeListCtrl"
        }).when('/employeeadd', {
            templateUrl: '/partials/addTraining.html', controller: "EmployeeAddCtrl"
        }).when('/alllist',{
            templateUrl: '/partials/allList.html', controller: "AllListCtrl"
        }).when('/approverlist',{
            templateUrl: '/partials/approverlist.html', controller: "ApproverListCtrl"
        }).when('/system',{
            templateUrl: '/partials/systemconfig.html', controller: "SystemConfigCtrl"
        }).otherwise({redirectTo: '/employeelist'});
    }]);