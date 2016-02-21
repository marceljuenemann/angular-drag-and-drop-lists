describe('dndList', function() {

  it('hides the placeholder element', function() {
    var element = compileAndLink('<dnd-list><img class="dndPlaceholder"></dnd-list>');
    expect(element.children().length).toBe(0);
  });

  it('disallows dropping from external sources', function() {
    element = compileAndLink('<div dnd-list="[]"></div>');
    var dragenter = Dragenter.validExternalOn(element);
    forAllHandlers(dragenter, element, verifyDropCancelled);
  });

  it('allows dropping from external sources if dnd-external-sources is set', function() {
    element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var dragenter = Dragenter.validExternalOn(element);
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  it('disallows mimetypes other than text', function() {
    element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var dragenter = Dragenter.externalOn(element, {'text/html': '{}'});
    forAllHandlers(dragenter, element, verifyDropCancelled);
  });

  it('allows drop if dataTransfer.types contains "Text"', function() {
    element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var dragenter = Dragenter.externalOn(element, {'image/jpeg': '[]', 'Text': '[]'});
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  // Old Internet Explorer versions don't have dataTransfer.types.
  it('allows drop if dataTransfer.types is undefined', function() {
    element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var dragenter = Dragenter.externalOn(element, {'Text': '[]'}, {undefinedTypes: true});
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  it('disallows dropping if dnd-disable-if is true', function() {
    var source = compileAndLink('<div dnd-draggable="{}"></div>');
    element = compileAndLink('<div dnd-list="[]" dnd-disable-if="disabled"></div>');
    element.scope().disabled = true;
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropCancelled);
  });

  it('allows drop if dnd-disable-if is false', function() {
    var source = compileAndLink('<div dnd-draggable="{}"></div>');
    element = compileAndLink('<div dnd-list="[]" dnd-disable-if="disabled"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropAccepted);
  });

  it('disallows dropping untyped elements if dnd-allowed-types is set', function() {
    var source = compileAndLink('<div dnd-draggable="{}"></div>');
    element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropCancelled);
  });

  it('disallows dropping elements of the wrong type if dnd-allowed-types is set', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'othertype\'"></div>');
    element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropCancelled);
  });

  it('allows dropping elements of the correct type if dnd-allowed-types is set', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
    element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropAccepted);
  });

  it('allows dropping external elements even if dnd-allowed-types is set', function() {
    element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']" ' +
                             'dnd-external-sources="true"></div>');
    forAllHandlers(Dragenter.validExternalOn(element), element, verifyDropAccepted);
  });

  describe('dragover handler', function() {
    var element, event;

    beforeEach(function() {
      triggerDragstart();
      element = compileAndLink('<div dnd-list="list"></div>');
      element.scope().list = [];
      event = createEvent('dragover');
      event.originalEvent.target = element[0];
    });

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

    it('removes placeholder element of parent list', function() {
      var childList = compileAndLink('<div dnd-list="list"></div>');
      element.append(childList);
      // Drag over parent list.
      event._triggerOn(element);
      expect(element.children().length).toBe(2);
      expect(childList.children().length).toBe(0);
      // Drag over child list.
      event.originalEvent.target = childList[0];
      event._triggerOn(childList);
      expect(element.children().length).toBe(1);
      expect(childList.children().length).toBe(1);
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
      triggerDragstart('mytype');
      element = createListWithItemsAndCallbacks();
      verifyDropAllowed(element, event);
      expect(element.scope().dragover.type).toBe('mytype');
    });

    it('invokes dnd-dragover callback for external elements', function() {
      triggerDragend();
      element = createListWithItemsAndCallbacks();
      verifyDropAllowed(element, event);
      expect(element.scope().dragover.external).toBe(true);
    });

    it('dnd-dragover callback can cancel the drop', function() {
      element = compileAndLink('<div dnd-list="list" dnd-dragover="false"></div>');
      verifyDropDisallowed(element, event);
    });

    describe('placeholder positioning (vertical)', positioningTests(false, false));
    describe('placeholder positioning (horizontal)', positioningTests(true, false));

    function positioningTests(horizontal) {
      return function() {
        var clientYField = 'client' + (horizontal ? 'X' : 'Y');
        var heightField = horizontal ? 'width' : 'height';
        var topField = horizontal ? 'left' : 'top';
        var oe;

        beforeEach(function() {
          element = createListWithItemsAndCallbacks(horizontal);
          angular.element(document.body).append(element);
          if (horizontal) {
            element.children().css('float','left');
          }
          oe = event.originalEvent;
        });

        afterEach(function() {
          element.remove();
        });

        it('adds actual placeholder element', function() {
          oe.target = element.children()[0];
          oe[clientYField] = 1;
          verifyDropAllowed(element, event);
          expect(element.scope().dragover.index).toBe(0);
          expect(angular.element(element.children()[0]).hasClass('dndPlaceholder')).toBe(true);
        });

        it('inserts before element if mouse is in first half', function() {
          oe.target = element.children()[1];
          var rect = oe.target.getBoundingClientRect();
          oe[clientYField] = rect[topField] + rect[heightField] / 2 - 1;
          verifyDropAllowed(element, event);
          expect(element.scope().dragover.index).toBe(1);
        });

        it('inserts after element if mouse is in second half', function() {
          oe.target = element.children()[1];
          var rect = oe.target.getBoundingClientRect();
          oe[clientYField] = rect[topField] + rect[heightField] / 2 + 1;
          verifyDropAllowed(element, event);
          expect(element.scope().dragover.index).toBe(2);
        });
      };
    }
  });

  describe('drop handler', function() {
    var element, dragoverEvent, dropEvent;

    beforeEach(function() {
      triggerDragstart();
      element = createListWithItemsAndCallbacks();
      dragoverEvent = createEvent('dragover');
      dragoverEvent.originalEvent.target = element.children()[0];
      dragoverEvent._triggerOn(element);
      dropEvent = createEvent('drop');
    });

    it('inserts into the list and removes dndDragover class', function() {
      expect(element.hasClass("dndDragover")).toBe(true);
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().list).toEqual([1, {example: 'data'}, 2, 3]);
      expect(element.hasClass("dndDragover")).toBe(false);
      expect(element.children().length).toBe(3);
    });

    it('inserts in correct position', function() {
      dragoverEvent.originalEvent.target = element.children()[2];
      dragoverEvent._triggerOn(element);
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().list).toEqual([1, 2, {example: 'data'}, 3]);
      expect(element.scope().inserted.index).toBe(2);
    });

    it('invokes the dnd-inserted callback', function() {
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().inserted.event).toBe(dropEvent.originalEvent);
      expect(element.scope().inserted.index).toBe(1);
      expect(element.scope().inserted.external).toBe(false);
      expect(element.scope().inserted.type).toBeUndefined();
      expect(element.scope().inserted.item).toBe(element.scope().list[1]);
    });

    it('dnd-drop can transform the object', function() {
      var testObject = {transformed: true};
      element.scope().dropHandler = function(params) {
        expect(params.event).toBe(dropEvent.originalEvent);
        expect(params.index).toBe(1);
        expect(params.external).toBe(false);
        expect(params.type).toBeUndefined();
        expect(params.item).toEqual({example: 'data'});
        return testObject;
      };
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().list[1]).toBe(testObject);
    });

    it('dnd-drop can cancel the drop', function() {
      element.scope().dropHandler = function() { return false; };
      expect(dropEvent._triggerOn(element)).toBe(true);
      expect(dropEvent._defaultPrevented).toBe(true);
      expect(element.scope().list).toEqual([1, 2, 3]);
      expect(element.scope().inserted).toBeUndefined();
      verifyDragoverStopped(element, dropEvent, 3);
    });

    it('dnd-drop can take care of inserting the element', function() {
      element.scope().dropHandler = function() { return true; };
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().list).toEqual([1, 2, 3]);
    });

    it('invokes callbacks with correct type', function() {
      triggerDragstart('mytype');
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().drop.type).toBe('mytype');
      expect(element.scope().inserted.type).toBe('mytype');
    });

    it('invokes callbacks for external elements', function() {
      triggerDragend();
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().drop.external).toBe(true);
      expect(element.scope().inserted.external).toBe(true);
    });

    it('can handle Text mime type', function() {
      dropEvent._data = {'Text': '{"lorem":"ipsum"}'};
      dropEvent._dt.types = ['Text'];
      verifyDropAllowed(element, dropEvent);
      expect(element.scope().list[1]).toEqual({lorem: 'ipsum'});
    });

    it('cancels drop when JSON is invalid', function() {
      dropEvent._data = {'text/plain': 'Lorem ipsum'};
      dropEvent._dt.types = ['Text'];
      expect(dropEvent._triggerOn(element)).toBe(true);
      expect(dropEvent._defaultPrevented).toBe(true);
      verifyDragoverStopped(element, dropEvent, 3);
    });

    describe('dropEffect calculation', function() {
      testDropEffect('move', 'move');
      testDropEffect('blub', 'blub');
      testDropEffect('copy', 'none', 'copy');
      testDropEffect('move', 'none', 'move');
      testDropEffect('move', 'none', 'link');
      testDropEffect('copy', 'none', 'link', true);

      function testDropEffect(expected, dropEffect, effectAllowed, ctrlKey) {
        it('stores ' + expected + ' for ' + [dropEffect, effectAllowed, ctrlKey], function() {
          dropEvent._dt.dropEffect = dropEffect;
          dropEvent._dt.effectAllowed = effectAllowed;
          dropEvent.originalEvent.ctrlKey = ctrlKey;
          verifyDropAllowed(element, dropEvent);
          expect(triggerDragend()).toBe(expected);
        });
      }
    });
  });

  describe('dragleave handler', function() {
    var element, event;

    beforeEach(function() {
      triggerDragstart();
      element = createListWithItemsAndCallbacks();
      angular.element(document.body).append(element);

      var dragoverEvent = createEvent('dragover');
      dragoverEvent.originalEvent.target = element[0];
      dragoverEvent._triggerOn(element);
      expect(element.hasClass('dndDragover')).toBe(true);
      expect(element.children().length).toBe(4);

      event = createEvent('dragleave');
    });

    afterEach(function() {
      element.remove();
    });

    it('removes the placeholder and dndDragover class', function() {
      var rect = element.children()[1].getBoundingClientRect();
      event.originalEvent.clientX = rect.left + 100;
      event.originalEvent.clientY = rect.top + 100;

      event._triggerOn(element);
      expect(element.hasClass('dndDragover')).toBe(false);
      expect(element.children().length).toBe(3);
    });

    it('does nothing if mouse is still inside dnd-list', function() {
      var rect = element.children()[1].getBoundingClientRect();
      event.originalEvent.clientX = rect.left + 2;
      event.originalEvent.clientY = rect.top + 2;

      event._triggerOn(element);
      expect(element.hasClass('dndDragover')).toBe(true);
      expect(element.children().length).toBe(4);
    });
  });

  function verifyDropAccepted(result) {
    expect(result.defaultPrevented).toBe(true);
    if (result.type == 'dragenter') {
      expect(result.returnValue).toBeUndefined();
      expect(result.propagationStopped).toBe(false);
    } else {
      expect(result.returnValue).toBe(false);
      expect(result.propagationStopped).toBe(true);
    }
  }

  function verifyDropCancelled(result, element, opt_defaultPrevented, opt_children) {
    expect(result.returnValue).toBe(true);
    expect(result.propagationStopped).toBe(false);
    expect(result.defaultPrevented).toBe(opt_defaultPrevented || false);
    expect(element.hasClass("dndDragover")).toBe(false);
    expect(element.children().length).toBe(opt_children || 0);
  }

  function forAllHandlers(dragenter, element, verify) {
    verify(dragenter, element);
    var dragover = dragenter.dragover(element, {target: element[0]});
    verify(dragover, element);
    var dragover2 = dragover.dragover(element);
    verify(dragover2, element);
    var drop = dragover2.drop(element);
    verify(drop, element);
  }

/*
 * ALL DEPRECATED
 */
  function verifyDropAllowed(element, event) {
    if (event.originalEvent.type == 'dragenter') {
      expect(event._triggerOn(element)).toBeUndefined();
      expect(event._propagationStopped).toBe(false);
    } else {
      expect(event._triggerOn(element)).toBe(false);
      expect(event._propagationStopped).toBe(true);
    }
    expect(event._defaultPrevented).toBe(true);
  }

  function verifyDropDisallowed(element, event) {
    expect(event._triggerOn(element)).toBe(true);
    expect(event._defaultPrevented).toBe(false);
    verifyDragoverStopped(element, event);
  }

  function verifyDragoverStopped(element, event, children) {
    expect(element.hasClass("dndDragover")).toBe(false);
    expect(element.children().length).toBe(children || 0);
    expect(event._propagationStopped).toBe(false);
  }

  function triggerDragstart(type) {
    var html = '<div dnd-draggable="{}"' + (type ? ' dnd-type="\'' + type + '\'"' : '') + '></div>';
    createEvent('dragstart')._triggerOn(compileAndLink(html));
  }

  function triggerDragend() {
    var element = compileAndLink('<div dnd-draggable dnd-dragend="result = dropEffect"></div>');
    createEvent('dragend')._triggerOn(element);
    return element.scope().result;
  }

/*
 * / ALL DEPRECATED
 */

  function createListWithItemsAndCallbacks(horizontal) {
    var params = '{event: event, index: index, item: item, external: external, type: type}';
    var element = compileAndLink('<ul dnd-list="list" dnd-external-sources="true" ' +
                  'dnd-horizontal-list="' + (horizontal || 'false') + '" ' +
                  'dnd-dragover="dragover = ' + params + '" ' +
                  'dnd-drop="dropHandler(' + params + ')" ' +
                  'dnd-inserted="inserted = ' + params + '">' +
                  '<li>A</li><li>B</li><li>C</li></ul>');
    element.scope().dropHandler = function(params) {
      element.scope().drop = params;
      return params.item;
    };
    element.scope().list = [1, 2, 3];
    element.css('position', 'relative');
    return element;
  }
});
