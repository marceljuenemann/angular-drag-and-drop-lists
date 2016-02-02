describe('dndDragging', function() {

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

  describe('dragstart', function() {
    var element, event;

    beforeEach(function() {
      element = compileAndLink(SIMPLE_HTML);
      event = createEvent('dragstart');
    });

    it('calls setData with serialized data', function() {
      event._triggerOn(element);
      expect(event._data).toEqual({'Text': '{"hello":"world"}'});
    });

    it('stops propagation', function() {
      event._triggerOn(element);
      expect(event._propagationStopped).toBe(true);
    });

    it('sets effectAllowed to move by default', function() {
      event._triggerOn(element);
      expect(event._dt.effectAllowed).toBe('move');
    });

    it('sets effectAllowed from dnd-effect-allowed', function() {
      element = compileAndLink('<div dnd-draggable dnd-effect-allowed="copyMove"></div>');
      event._triggerOn(element);
      expect(event._dt.effectAllowed).toBe('copyMove');
    });

    it('adds CSS classes to element', inject(function($timeout) {
      event._triggerOn(element);
      expect(element.hasClass('dndDragging')).toBe(true);
      expect(element.hasClass('dndDraggingSource')).toBe(false);

      $timeout.flush(0);
      expect(element.hasClass('dndDraggingSource')).toBe(true);
    }));

    it('invokes dnd-dragstart callback', function() {
      element = compileAndLink('<div dnd-draggable dnd-dragstart="ev = event"></div>');
      event._triggerOn(element);
      expect(element.scope().ev).toBe(event.originalEvent);
    });

    it('initializes workarounds', inject(function(dndDropEffectWorkaround, dndDragTypeWorkaround) {
      event._triggerOn(element);
      expect(dndDragTypeWorkaround.isDragging).toBe(true);
      expect(dndDragTypeWorkaround.dragType).toBeUndefined();
      expect(dndDropEffectWorkaround.dropEffect).toBe('none');
    }));

    it('initializes workarounds respecting dnd-type', inject(function(dndDragTypeWorkaround) {
      element = compileAndLink('<div dnd-draggable dnd-type="2 * 2"></div>');
      event._triggerOn(element);
      expect(dndDragTypeWorkaround.dragType).toEqual(4);
    }));
  });
});
