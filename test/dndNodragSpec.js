describe('dndNodrag', function() {
  var element, event;

  beforeEach(function() {
    element = compileAndLink('<div dnd-nodrag></div>');
    event = createEvent('dragstart');
  });

  it('sets the draggable attribute', function() {
    expect(element.attr('draggable')).toBe('true');
  });

  it('stops propagation and prevents default for dragstart events', function() {
    event._triggerOn(element);
    expect(event._propagationStopped).toBe(true);
    expect(event._defaultPrevented).toBe(true);
  });

  it('does not call preventDefault if dataTransfer is already set', function() {
    event._dt.types = ['text/plain'];
    event._triggerOn(element);
    expect(event._propagationStopped).toBe(true);
    expect(event._defaultPrevented).toBeFalsy();
  });

  it('stops propagation of dragend events', function() {
    event = createEvent('dragend');
    event._triggerOn(element);

    expect(event._propagationStopped).toBe(true);
    expect(event._defaultPrevented).toBeFalsy();
  });
});
