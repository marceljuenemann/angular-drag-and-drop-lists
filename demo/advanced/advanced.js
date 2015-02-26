angular.module("demo").controller("AdvancedDemoController", function($scope) {

    $scope.dragoverCallback = function(event, index, external, type) {
        $scope.logListEvent('dragged over', event, index, external, type);
        return index > 0;
    };

    $scope.dropCallback = function(event, index, item, external, type, allowedType) {
        $scope.logListEvent('dropped at', event, index, external, type);
        if (external) {
            if (allowedType === 'itemType' && !item.label) return false;
            if (allowedType === 'containerType' && !angular.isArray(item)) return false;
        }
        return item;
    };

    $scope.logEvent = function(message, event, item) {
        console.log(message + ' (triggered by the following ' + event.type + ' event)%s',
          (item ? ' of "' + item.label + '"': ''));
        console.log(event);
    };

    $scope.logListEvent = function(action, event, index, external, type, item) {
        var message = external ? 'External ' : '';
        message += type + ' element is ' + action + ' position ' + index;
        $scope.logEvent(message, event, item);
    };

    $scope.model = [];

    var Item = function Item(label) {
      this.label = label;
      this.moveCount = 0;
      this.copyCount = 0;
    };

    Item.prototype.moved = function moved() {
      this.moveCount++;
    };

    Item.prototype.copied = function copied() {
      this.copyCount++;
    };

    // Initialize model
    var id = 10;
    for (var i = 0; i < 3; ++i) {
        $scope.model.push([]);
        for (var j = 0; j < 2; ++j) {
            $scope.model[i].push([]);
            for (var k = 0; k < 7; ++k) {
                $scope.model[i][j].push(new Item('Item ' + id++));
            }
        }
    }

    // this will replace the $watch, which will no longer work, because the
    // item references do not change.
    $scope.toJson = function toJson(model) {
      return angular.toJson(model, true);
    };

});
