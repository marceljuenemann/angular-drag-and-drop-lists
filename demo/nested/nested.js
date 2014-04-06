angular.module("demo").controller("NestedListsDemoController", function($scope) {

    $scope.models = {
        selected: null,
        dropzones: {"A": [
            {type: "item", id: 1},
            {type: "item", id: 2},
            {
                type: "container",
                id: 1,
                columns: [
                    [{type: "item", id: 3}, {type: "item", id: 4}],
                    [{type: "item", id: 5}]
                ]
            },
            {type: "item", id: 6},
            {type: "item", id: 7},
        ], "B": []},
        templates: [
            {type: "item", id: 2},
            {type: "container", id: 1, columns: [[], []]}
        ]
    };

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

});
