var $compile,
    $scope;

beforeEach(module('dndLists'));

beforeEach(inject(function(_$compile_, _$rootScope_){
  $compile = _$compile_;
  $scope = _$rootScope_;
}));

function compileAndLink(html) {
  var element = $compile(html)($scope);
  $scope.$digest();
  return element;
}
