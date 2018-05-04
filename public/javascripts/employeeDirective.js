var employeeDirective = angular.module('employeeDirective', [])

employeeDirective.directive("addAdmin", function () {
    return {
        restrict: "E",
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='addAdmin()'> <span class='lyphicon glyphicon-plus'></span> Add </a>",
        replace: true,
        link: function (scope) {
            scope.addAdmin = function () {
                scope.adminlist.push({});
            }
        }
    }
}).directive("addApprover", function () {
    return {
        restrict: "E",
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='addApprover()'> <span class='lyphicon glyphicon-plus'></span> Add </a>",
        replace: true,
        link: function (scope) {
            scope.addApprover = function () {
                scope.approverlist.push({});
            }
        }
    }
}).directive("addAccountant", function () {
    return {
        restrict: "E",
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='addAccountant()'> <span class='lyphicon glyphicon-plus'></span> Add </a>",
        replace: true,
        link: function (scope) {
            scope.addAccountant = function () {
                scope.accountantlist.push({});
            }
        }
    }
}).directive("addEmailgroup", function () {
    return {
        restrict: "E",
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='addEmailGroup()'> <span class='lyphicon glyphicon-plus'></span> Add </a>",
        replace: true,
        link: function (scope) {
            scope.addEmailGroup = function () {
                scope.emailgrouptlist.push({});
            }
        }
    }
});
employeeDirective.directive("deleteAdmin", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='removeAdmin($index)'> <span class='glyphicon glyphicon-remove'></span> Remove </a>",
        link: function (scope, element, attr) {
            scope.removeAdmin = function ($index) {
                scope.$emit("removeAdmin", $index);
            }
        }
    }
}).directive("deleteApprover", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='removeApprover($index)'> <span class='glyphicon glyphicon-remove'></span> Remove </a>",
        link: function (scope, element, attr) {
            scope.removeApprover = function ($index) {
                scope.$emit("removeApprover", $index);

            }
        }
    }
}).directive("deleteAccountant", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='removeAccountant($index)'> <span class='glyphicon glyphicon-remove'></span> Remove </a>",
        link: function (scope, element, attr) {
            scope.removeAccountant = function ($index) {
                scope.$emit("removeAccountant", $index);

            }
        }
    }
}).directive("deleteEmailgroup", function () {
    return {
        restrict: "E",
        replace: true,
        template: "<a style='margin-left: 45%;border: none;' href='javascript:void(0);' type='button' class='btn btn-default btn-sm' ng-click='removeEmailGroup($index)'> <span class='glyphicon glyphicon-remove'></span> Remove </a>",
        link: function (scope, element, attr) {
            scope.removeEmailGroup = function ($index) {
                scope.$emit("removeEmailGroup", $index);
            }
        }
    }
});