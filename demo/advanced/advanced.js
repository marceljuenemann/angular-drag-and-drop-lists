/**
 * The controller doesn't do much more than setting the initial data model
 */
angular.module("demo").controller("AdvancedDemoController", function($scope) {

    $scope.model = [];

    // Initialize model
    var id = 10;
    for (var i = 0; i < 3; ++i) {
        $scope.model.push([]);
        for (var j = 0; j < 2; ++j) {
            $scope.model[i].push([]);
            for (var k = 0; k < 7; ++k) {
                $scope.model[i][j].push({label: 'Item ' + id++});
            }
        }
    }

    $scope.$watch('model', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

});
