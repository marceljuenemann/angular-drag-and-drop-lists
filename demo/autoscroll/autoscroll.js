angular.module("demo").controller("AutoScrollDemoController", function($scope) {

    $scope.models = {
        selected: null,
        lists: {"large": [], "narrow": []}
    };

    // Generate initial model
    for (var i = 1; i <= 10; ++i) {
        $scope.models.lists.large.push({label: "Item Large " + i});
        $scope.models.lists.narrow.push({label: "Item Narrow " + i});
    }
});
