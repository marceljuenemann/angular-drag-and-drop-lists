angular.module("demo").controller("TypesDemoController", function($scope) {

    $scope.models = {
        selected: null,
        lists: [
			{
				label: "Men",
				allowedTypes: ['man'],
				people: [
					{name: "Bob", type: "man"},
					{name: "Charlie", type: "man"},
					{name: "Dave", type: "man"}
				]
			},
			{
				label: "Women",
				allowedTypes: ['woman'],
				people: [
					{name: "Alice", type: "woman"},
					{name: "Eve", type: "woman"},
					{name: "Peggy", type: "woman"}
				]
			},
			{
				label: "People",
				allowedTypes: ['man', 'woman'],
				people: [
					{name: "Frank", type: "man"},
					{name: "Mallory", type: "woman"},
					{name: "Oscar", type: "man"},
					{name: "Wendy", type: "woman"}
				]
			}
		]
    };

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

});
