/**
 * The controller doesn't do much more than setting the initial data model
 */
angular.module("demo").controller("AdvancedDemoController", function($scope) {

    $scope.logEvent = function(message, event) {
        console.log(message, '(triggered by the following', event.type, 'event)');
        console.log(event);
    };

    $scope.dragoverCallback = function(event, index, type) {
        $scope.logEvent(type + ' element is dragged over position ' + index, event);
        return index > 0;
    };

    $scope.dropCallback = function(event, index, item, type) {
        $scope.logEvent(type + ' element was dropped at position ' + index, event);
        if (type === 'itemType') {
            if (item.label === 'Item 33') return false;
            item.label += ' (dropped)';
        }
        return item;
    };

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
