angular.module("demo", ["ngRoute"]).config(function($routeProvider) {
    $routeProvider
        .when('/simple', {
            templateUrl: 'simple/simple.html',
            controller: 'SimpleDemoController'
        })
        .otherwise({redirectTo: '/simple'});
});
