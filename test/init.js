var $compile,
    $rootScope;

beforeEach(module('dndLists'));

beforeEach(inject(function(_$compile_, _$rootScope_){
  $compile = _$compile_;
  $rootScope = _$rootScope_;
}));

afterEach(function() {
  // Reset internal dndState in case dragend was not called.
  Dragend.on(compileAndLink('<div dnd-draggable="{}"></div>'));
});

function compileAndLink(html) {
  var scope = $rootScope.$new();
  var element = $compile(html)(scope);
  scope.$digest();
  return element;
}
