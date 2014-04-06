angular.module("demo", ["ngRoute", "dndLists"]).config(function($routeProvider) {
    $routeProvider
        .when('/simple', {
            templateUrl: 'simple/simple.html',
            controller: 'SimpleDemoController'
        })
        .when('/nested', {
            templateUrl: 'nested/nested.html',
            controller: 'NestedListsDemoController'
        })
        .otherwise({redirectTo: '/nested'});
});
