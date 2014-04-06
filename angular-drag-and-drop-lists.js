angular.module('dndLists', [])
    .directive('dndDraggable', function($parse, $timeout) {
        return function(scope, element, attr) {
            var model = attr.dndDraggable;

            element.attr("draggable", "true");

            element.on('click', function(event) {
                scope.$apply(function() {
                    $parse(attr.dndSelected)(scope);
                });

                event.stopPropagation();
            });

            element.on('dragstart', function(event) {
                var data = angular.toJson(scope.$eval(model));
                event.dataTransfer.setData("json", data);
                event.dataTransfer.effectAllowed = attr.dndEffectAllowed;

                // We can not hide the element instantly because
                // that would abort the dragging
                element.addClass("dndDragging");
                $timeout(function() {
                    element.addClass("dndDraggingSource");
                }, 0);

                event.stopPropagation();
            });

            element.on('dragend', function(event) {
                scope.$apply(function() {
                    switch (event.dataTransfer.dropEffect) {
                        case "move":
                            $parse(attr.dndMoved)(scope);
                            break;

                        case "copy":
                            $parse(attr.dndCopied)(scope);
                            break;
                    }
                });

                element.removeClass("dndDragging");
                element.removeClass("dndDraggingSource");
                event.stopPropagation();
            });

        };
    })

    .directive('dndList', function($timeout) {
        return function(scope, element, attr) {
            var listNode = element[0];
            var placeholder = angular.element("<li class='dndPlaceholder'></li>");
            var placeholderNode = placeholder[0];
            var dropzoneList = attr.dndList;

            element.on('dragover', function(event) {
                // convert type list to real array
                if (Array.prototype.indexOf.call(event.dataTransfer.types, "json") === -1) {
                    return true;
                }

                if (event.target.parentNode === listNode) {
                    // This would be easier with index() and before() methods
                    var targetIndex = Array.prototype.indexOf.call(listNode.children, event.target);
                    var placeholderIndex = Array.prototype.indexOf.call(listNode.children, placeholderNode);
                    var insertBefore = targetIndex < placeholderIndex ? event.target : event.target.nextSibling;
                    listNode.insertBefore(placeholderNode, insertBefore);
                }

                element.addClass("dragover");
                event.preventDefault();
                event.stopPropagation();
            });

            element.on('dragenter', function(event) {
                // Add placeholder element if it's not shown yet
                // This is especially needed with empty lists
                if (placeholderNode.parentNode != listNode) {
                    element.append(placeholder);
                }

                event.stopPropagation();

            });

            element.on('dragleave', function(event) {
                element.removeClass("dragover");
                $timeout(function() {
                    // If we are still inside the dropzone the dragover
                    // class will have been set again in the meantime
                    if (!element.hasClass("dragover")) {
                        placeholder.remove();
                    }
                }, 100);
            });

            element.on('drop', function(event) {
                var placeholderIndex = Array.prototype.indexOf.call(listNode.children, placeholderNode);

                var target = scope.$eval(dropzoneList);
                var model = JSON.parse(event.dataTransfer.getData("json"));


                scope.$apply(function() {
                    target.splice(placeholderIndex, 0, model);
                });

                placeholder.remove();

                event.preventDefault();
                event.stopPropagation();

            });
        };
    });
/*
    .controller('MyCtrl1', ['$scope', function($scope) {
        $scope.toolbox = [
            {
                type: "item",
                id: 1
            },
            {
                type: "container",
                id: 1,
                columns: [[], []]
            }
        ];

        $scope.lists = [[], []];

        $scope.model = {
            selected: null
        };

        $scope.selectItem = function(item) {
            console.log("select reached me!");
            $scope.model.selected = item;
        };

        $scope.$watch('lists', function(lists) {
            $scope.result = angular.toJson(lists, true);
        }, true);


    }])
    .controller('MyCtrl2', [function() {

    }]);
*/