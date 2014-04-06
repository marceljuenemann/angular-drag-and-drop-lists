angular.module("demo", ["ngRoute", "dndLists"]).config(function($routeProvider) {
    $routeProvider
        .when('/simple', {
            templateUrl: 'simple/simple.html',
            controller: 'SimpleDemoController'
        })
        .otherwise({redirectTo: '/simple'});
});
