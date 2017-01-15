describe('dndDraggable', function() {

  var SIMPLE_HTML = '<div dnd-draggable="{hello: \'world\'}"></div>';

  describe('constructor', function() {
    it('sets the draggable attribute', function() {
      var element = compileAndLink(SIMPLE_HTML);
      expect(element.attr('draggable')).toBe('true');
    });

    it('watches and handles the dnd-disabled-if expression', function() {
      var element = compileAndLink('<div dnd-draggable dnd-disable-if="disabled"></div>');
      expect(element.attr('draggable')).toBe('true');

      element.scope().disabled = true;
      element.scope().$digest();
      expect(element.attr('draggable')).toBe('false');

      element.scope().disabled = false;
      element.scope().$digest();
      expect(element.attr('draggable')).toBe('true');
    });
  });

  describe('dragstart handler', function() {
    var element;

    beforeEach(function() {
      element = compileAndLink(SIMPLE_HTML);
    });

    it('calls setData with serialized data', function() {
      expect(Dragstart.on(element).data).toEqual({'application/x-dnd': '{"hello":"world"}'});
    });

    it('includes the dnd-type in the mime type', function() {
      element = compileAndLink('<div dnd-draggable="{}" dnd-type="\'foo\'"></div>');
      expect(Dragstart.on(element).data).toEqual({'application/x-dnd-foo': '{}'});
    });

    it('converts the dnd-type to lower case', function() {
      element = compileAndLink('<div dnd-draggable="{}" dnd-type="\'Foo\'"></div>');
      expect(Dragstart.on(element).data).toEqual({'application/x-dnd-foo': '{}'});
    });

    it('uses application/json mime type if custom types are not allowed', function() {
      element = compileAndLink('<div dnd-draggable="[1]"></div>');
      var dragstart = Dragstart.on(element, {allowedMimeTypes: ['Text', 'application/json']});
      expect(dragstart.data).toEqual({'application/json': '{"item":[1]}'});
    });

    it('uses Text mime type in Internet Explorer', function() {
      element = compileAndLink('<div dnd-draggable="{}" dnd-type="\'Foo\'"></div>');
      var dragstart = Dragstart.on(element, {allowedMimeTypes: ['URL', 'Text']});
      expect(dragstart.data).toEqual({
        'Text': '{"item":{},"type":"foo"}'
      });
    });

    it('stops propagation', function() {
      expect(Dragstart.on(element).propagationStopped).toBe(true);
    });

    it('sets effectAllowed to move by default', function() {
      expect(Dragstart.on(element).effectAllowed).toBe('move');
    });

    it('sets effectAllowed from dnd-effect-allowed', function() {
      element = compileAndLink('<div dnd-draggable dnd-effect-allowed="copyMove"></div>');
      expect(Dragstart.on(element).effectAllowed).toBe('copyMove');
    });

    it('sets effectAllowed to single effect in IE', function() {
      element = compileAndLink('<div dnd-draggable dnd-effect-allowed="copyLink"></div>');
      expect(Dragstart.on(element, {allowedMimeTypes: ['Text']}).effectAllowed).toBe('copy');
    });

    it('adds CSS classes to element', inject(function($timeout) {
      Dragstart.on(element);
      expect(element.hasClass('dndDragging')).toBe(true);
      expect(element.hasClass('dndDraggingSource')).toBe(false);

      $timeout.flush(0);
      expect(element.hasClass('dndDraggingSource')).toBe(true);
    }));

    it('invokes dnd-dragstart callback', function() {
      element = compileAndLink('<div dnd-draggable dnd-dragstart="ev = event"></div>');
      Dragstart.on(element);
      expect(element.scope().ev).toEqual(jasmine.any(DragEventMock));
    });

    it('does not start dragging if dnd-disable-if is true', function() {
      element = compileAndLink('<div dnd-draggable dnd-disable-if="true"></div>');
      var dragstart = Dragstart.on(element);
      expect(dragstart.returnValue).toBe(true);
      expect(dragstart.defaultPrevented).toBe(false);
      expect(dragstart.propagationStopped).toBe(false);
    });

    it('sets the dragImage if event was triggered on a dnd-handle', function() {
      var dragstart = Dragstart.on(element, {allowSetDragImage: true, dndHandle: true});
      expect(dragstart.dragImage).toBe(element[0]);
    });
  });

  describe('dragend handler', function() {
    var element, dragstart;

    beforeEach(function() {
      element = compileAndLink(SIMPLE_HTML);
      dragstart = Dragstart.on(element);
    });

    it('stops propagation', function() {
      expect(dragstart.dragend(element).propagationStopped).toBe(true);
    });

    it('removes CSS classes from element', inject(function($timeout) {
      $timeout.flush(0);
      expect(element.hasClass('dndDragging')).toBe(true);
      expect(element.hasClass('dndDraggingSource')).toBe(true);

      dragstart.dragend(element);
      expect(element.hasClass('dndDragging')).toBe(false);
      expect(element.hasClass('dndDraggingSource')).toBe(false);
    }));

    it('removes dndDraggingSource after a timeout', inject(function($timeout) {
      // IE 9 might not flush the $timeout before invoking the dragend handler.
      expect(element.hasClass('dndDragging')).toBe(true);
      expect(element.hasClass('dndDraggingSource')).toBe(false);

      dragstart.dragend(element);
      expect(element.hasClass('dndDragging')).toBe(false);
      expect(element.hasClass('dndDraggingSource')).toBe(false);

      $timeout.flush(0);
      expect(element.hasClass('dndDragging')).toBe(false);
      expect(element.hasClass('dndDraggingSource')).toBe(false);
    }));

    var dropEffects = {move: 'moved', copy: 'copied', link: 'linked', none: 'canceled'};
    angular.forEach(dropEffects, function(callback, dropEffect) {
      it('calls callbacks for dropEffect ' + dropEffect, function() {
        var html = '<div dnd-draggable="{}" dnd-effect-allowed="' + dropEffect + '" '
                 + 'dnd-dragend="returnedDropEffect = dropEffect" '
                 + 'dnd-' + callback + '="returnedEvent = event"></div>';
        var element = compileAndLink(html);
        var target = compileAndLink('<div dnd-list="[]"></div>');
        Dragstart.on(element).dragover(target).drop(target).dragend(element);

        expect(element.scope().returnedEvent).toEqual(jasmine.any(DragEventMock));
        expect(element.scope().returnedDropEffect).toBe(dropEffect);
      });
    });
  });

  describe('click handler', function() {
    it('does nothing if dnd-selected is not set', function() {
      var element = compileAndLink(SIMPLE_HTML);
      var click = new DragEventResult(element, 'click',  new DataTransferMock(), {});
      expect(click.propagationStopped).toBe(false);
    });

    it('invokes dnd-selected callback and stops propagation', function() {
      var element = compileAndLink('<div dnd-draggable dnd-selected="selected = true"></div>');
      var click = new DragEventResult(element, 'click',  new DataTransferMock(), {});
      expect(click.propagationStopped).toBe(true);
      expect(element.scope().selected).toBe(true);
    });
  });
});
