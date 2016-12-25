describe('dndNodrag', function() {
  var element;

  beforeEach(function() {
    element = compileAndLink('<div dnd-nodrag></div>');
  });

  it('sets the draggable attribute', function() {
    expect(element.attr('draggable')).toBe('true');
  });

  it('stops propagation and prevents default for dragstart events', function() {
    var dragstart = Dragstart.on(element);
    expect(dragstart.propagationStopped).toBe(true);
    expect(dragstart.defaultPrevented).toBe(true);
  });

  it('does not call preventDefault if dataTransfer is already set', function() {
    var dragstart = Dragstart.on(element, {presetTypes: ['text/plain']});
    expect(dragstart.propagationStopped).toBe(true);
    expect(dragstart.defaultPrevented).toBe(false);
  });

  it('does nothing in dragstart if the event was triggered on a dnd-handle', function() {
    var dragstart = Dragstart.on(element, {dndHandle: true});
    expect(dragstart.propagationStopped).toBe(false);
    expect(dragstart.defaultPrevented).toBe(false);
  });

  it('stops propagation of dragend events', function() {
    var dragend = Dragend.on(element);
    expect(dragend.propagationStopped).toBe(true);
    expect(dragend.defaultPrevented).toBe(false);
  });

  it('does nothing in dragend if the event was triggered on a dnd-handle', function() {
    var dragend = Dragend.on(element, {dndHandle: true});
    expect(dragend.propagationStopped).toBe(false);
    expect(dragend.defaultPrevented).toBe(false);
  });
});
