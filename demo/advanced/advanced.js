/**
 * The controller doesn't do much more than setting the initial data model
 */
angular.module("demo").controller("AdvancedDemoController", function($scope) {

    $scope.model = [
        [
            ['Item 1', 'Item 2', 'Item 3'],
            ['Item 4', 'Item 5', 'Item 6']
        ],
        [
            ['Item 7', 'Item 8', 'Item 9'],
            ['Item 10', 'Item 11', 'Item 12']
        ],
        [
            ['Item 13', 'Item 14', 'Item 15'],
            ['Item 16', 'Item 17', 'Item 18']
        ]];

    $scope.$watch('model', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

});
