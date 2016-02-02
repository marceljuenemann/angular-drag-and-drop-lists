describe('dndDragging', function() {

  describe('dndDragging', function() {
    var HTML = '<div dnd-draggable="{hello: world}"></div>';

    it('sets the draggable attribute', function() {
      var element = compileAndLink(HTML);
      expect(element.attr('draggable')).toBe('true');
    });
  });

  describe('dnd-disable-if', function() {
    var HTML = '<div dnd-draggable dnd-disable-if="disabled"></div>';

    it('watches the expression and disables dragging', function() {
      var element = compileAndLink(HTML);
      expect(element.attr('draggable')).toBe('true');

      $scope.disabled = true;
      $scope.$digest();
      expect(element.attr('draggable')).toBe('false');

      $scope.disabled = false;
      $scope.$digest();
      expect(element.attr('draggable')).toBe('true');
    });
  });
});
