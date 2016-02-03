describe('dndList', function() {
  var element,
      event,
      dragTypeWorkaround,
      dropEffectWorkaround;

  beforeEach(inject(function(dndDropEffectWorkaround, dndDragTypeWorkaround) {
    element = compileAndLink('<div dnd-list="list"></div>');
    element.scope().list = [];
    dragTypeWorkaround = dndDragTypeWorkaround;
    dropEffectWorkaround = dndDropEffectWorkaround;

    // Initialise internal state by calling dragstart.
    createEvent('dragstart')._triggerOn(compileAndLink('<div dnd-draggable="{}"></div>'));
  }));

  describe('constructor', function() {
    it('hides the placeholder element', function() {
      element = compileAndLink('<dnd-list><img class="dndPlaceholder"></dnd-list>');
      expect(element.children().length).toBe(0);
    });
  });

  describe('dragover handler', function() {
    commonTests('dragover');

    it('adds dndDragover CSS class', function() {
      verifyDropAllowed(element, event);
      expect(element.hasClass('dndDragover')).toBe(true);
    });

    it('adds placeholder element', function() {
      verifyDropAllowed(element, event);
      expect(element.children().length).toBe(1);
      expect(element.children()[0].tagName).toBe('LI');
    });

    it('reuses custom placeholder element if it exists', function() {
      element = compileAndLink('<dnd-list><img class="dndPlaceholder"></dnd-list>');
      verifyDropAllowed(element, event);
      expect(element.children().length).toBe(1);
      expect(element.children()[0].tagName).toBe('IMG');
    });

    it('invokes dnd-dragover callback', function() {
      element = createListWithItemsAndCallbacks();
      verifyDropAllowed(element, event);
      expect(element.scope().dragover.event).toBe(event.originalEvent);
      expect(element.scope().dragover.index).toBe(3);
      expect(element.scope().dragover.external).toBe(false);
      expect(element.scope().dragover.type).toBeUndefined();
      expect(element.scope().dragover.item).toBeUndefined();
    });

    it('invokes dnd-dragover callback with correct type', function() {
      element = createListWithItemsAndCallbacks();
      dragTypeWorkaround.dragType = 'mytype';
      verifyDropAllowed(element, event);
      expect(element.scope().dragover.type).toBe('mytype');
    });

    it('invokes dnd-dragover callback for external elements', function() {
      element = createListWithItemsAndCallbacks();
      dragTypeWorkaround.isDragging = undefined;
      verifyDropAllowed(element, event);
      expect(element.scope().dragover.external).toBe(true);
    });

    describe('placeholder positioning (vertical)', positioningTests(false, false));
    describe('placeholder positioning (vertical, IE)', positioningTests(false, true));
    describe('placeholder positioning (horizontal', positioningTests(true, false));
    describe('placeholder positioning (horizontal, IE)', positioningTests(true, true));

    function positioningTests(horizontal, relative) {
      return function() {
        var offsetYField = (relative ? 'layer' : 'offset') + (horizontal ? 'X' : 'Y');
        var offsetHeightField = 'offset' + (horizontal ? 'Width' : 'Height');
        var offsetTopField = 'offset' + (horizontal ? 'Left' : 'Top');

        beforeEach(function() {
          element = createListWithItemsAndCallbacks(horizontal);
          angular.element(document.body).append(element);
          if (horizontal) {
            element.children().css('float','left');
          }
        });

        afterEach(function() {
          element.remove();
        });

        it('adds actual placeholder element', function() {
          event.originalEvent.target = element.children()[0];
          event.originalEvent[offsetYField] = 1;
          verifyDropAllowed(element, event);
          expect(element.scope().dragover.index).toBe(0);
          expect(angular.element(element.children()[0]).hasClass('dndPlaceholder')).toBe(true);
        });

        it('inserts before element if mouse is in first half', function() {
          event.originalEvent.target = element.children()[1];
          event.originalEvent[offsetYField] = event.originalEvent.target[offsetHeightField] / 2 - 1;
          if (relative) {
            event.originalEvent[offsetYField] += event.originalEvent.target[offsetTopField];
            event.originalEvent.target = element[0];
          }
          verifyDropAllowed(element, event);
          expect(element.scope().dragover.index).toBe(1);
        });

        it('inserts after element if mouse is in second half', function() {
          event.originalEvent.target = element.children()[1];
          event.originalEvent[offsetYField] = event.originalEvent.target[offsetHeightField] / 2 + 1;
          if (relative) {
            event.originalEvent[offsetYField] += event.originalEvent.target[offsetTopField];
            event.originalEvent.target = element[0];
          }
          verifyDropAllowed(element, event);
          expect(element.scope().dragover.index).toBe(2);
        });
      };
    }
  });

  describe('drop handler', function() {
    commonTests('drop');
  });

  function commonTests(eventType) {
    beforeEach(function() {
      event = createEvent(eventType);
      event.originalEvent.target = element[0];
    });

    it('disallows dropping from external sources', function() {
      dragTypeWorkaround.isDragging = false;
      verifyDropDisallowed(element, event);
    });

    it('allows dropping from external sources if dnd-external-sources is set', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
      dragTypeWorkaround.isDragging = false;
      verifyDropAllowed(element, event);
    });

    it('disallows mimetypes other than text', function() {
      event._dt.types = ['text/html'];
      verifyDropDisallowed(element, event);
    });

    it('allows drop if dataTransfer.types contains "Text"', function() {
      event._dt.types = ['image/jpeg', 'Text'];
      verifyDropAllowed(element, event);
    });

    // Old Internet Explorer versions don't have dataTransfer.types.
    it('allows drop if dataTransfer.types is undefined', function() {
      event._dt.types = undefined;
      verifyDropAllowed(element, event);
    });

    it('disallows dropping if dnd-disable-if is true', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-disable-if="disabled"></div>');
      element.scope().disabled = true;
      verifyDropDisallowed(element, event);
    });

    it('allows drop if dnd-disable-if is false', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-disable-if="disabled"></div>');
      verifyDropAllowed(element, event);
    });

    it('disallows dropping untyped elements if dnd-allowed-types is set', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
      verifyDropDisallowed(element, event);
    });

    it('disallows dropping elements of the wrong type if dnd-allowed-types is set', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
      dragTypeWorkaround.dragType = 'othertype';
      verifyDropDisallowed(element, event);
    });

    it('allows dropping elements of the correct type if dnd-allowed-types is set', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
      dragTypeWorkaround.dragType = 'mytype';
      verifyDropAllowed(element, event);
    });

    it('allows dropping external elements even if dnd-allowed-types is set', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']" ' +
                               'dnd-external-sources="true"></div>');
      dragTypeWorkaround.isDragging = false;
      verifyDropAllowed(element, event);
    });
  }

  function verifyDropAllowed(element, event) {
    expect(event._triggerOn(element)).toBe(false);
    expect(event._defaultPrevented).toBe(true);
    expect(event._propagationStopped).toBe(true);
  }

  function verifyDropDisallowed(element, event) {
    expect(event._triggerOn(element)).toBe(true);
    expect(event._defaultPrevented).toBeFalsy();
    verifyDragoverStopped(element, event);
  }

  function verifyDragoverStopped(element, event) {
    expect(element.hasClass("dndDragover")).toBe(false);
    expect(element.children().length).toBe(0);
    expect(event._propagationStopped).toBeFalsy();
  }

  function createListWithItemsAndCallbacks(horizontal) {
    var params = '{event: event, index: index, item: item, external: external, type: type}';
    var element = compileAndLink('<ul dnd-list="list" dnd-external-sources="true" ' +
                  'dnd-horizontal-list="' + (horizontal || 'false') + '" ' +
                  'dnd-dragover="dragover = ' + params + '" ' +
                  'dnd-drop="dragover = ' + params + '" ' +
                  'dnd-inserted="dragover = ' + params + '">' +
                  '<li>A</li><li>B</li><li>C</li></ul>');
    element.css('position', 'relative');
    element.scope().list = [];
    return element;
  }
});
