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
    var source, element;

    beforeEach(function() {
      source = compileAndLink('<div dnd-draggable="{}"></div>');
      element = compileAndLink('<div dnd-list="list"></div>');
      element.scope().list = [];
    });

    it('adds dndDragover CSS class', function() {
      Dragstart.on(source).dragover(element);
      expect(element.hasClass('dndDragover')).toBe(true);
    });

    it('adds placeholder element', function() {
      Dragstart.on(source).dragover(element);
      expect(element.children().length).toBe(1);
      expect(element.children()[0].tagName).toBe('LI');
    });

    it('reuses custom placeholder element if it exists', function() {
      element = compileAndLink('<dnd-list><img class="dndPlaceholder"></dnd-list>');
      Dragstart.on(source).dragover(element);
      expect(element.children().length).toBe(1);
      expect(element.children()[0].tagName).toBe('IMG');
    });

    it('removes placeholder element of parent list', function() {
      var childList = compileAndLink('<div dnd-list="list"></div>');
      element.append(childList);
      // Drag over parent list.
      var dragover = Dragstart.on(source).dragover(element);
      expect(element.children().length).toBe(2);
      expect(childList.children().length).toBe(0);
      // Drag over child list.
      dragover.dragover(childList);
      expect(element.children().length).toBe(1);
      expect(childList.children().length).toBe(1);
    });

    it('invokes dnd-dragover callback', function() {
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source).dragover(element);
      expect(element.scope().dragover.event).toEqual(jasmine.any(DragEventMock));
      expect(element.scope().dragover.index).toBe(3);
      expect(element.scope().dragover.external).toBe(false);
      expect(element.scope().dragover.type).toBeUndefined();
      expect(element.scope().dragover.item).toBeUndefined();
    });

    it('invokes dnd-dragover callback with correct type', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source).dragover(element);
      expect(element.scope().dragover.type).toBe('mytype');
    });

    it('invokes dnd-dragover callback for external elements', function() {
      element = createListWithItemsAndCallbacks();
      Dragenter.validExternalOn(element).dragover(element);
      expect(element.scope().dragover.external).toBe(true);
    });

    it('dnd-dragover callback can cancel the drop', function() {
      element = compileAndLink('<div dnd-list="list" dnd-dragover="false"></div>');
      verifyDropCancelled(Dragstart.on(source).dragover(element), element);
    });

    describe('placeholder positioning (vertical)', positioningTests(false, false));
    describe('placeholder positioning (horizontal)', positioningTests(true, false));

    function positioningTests(horizontal) {
      return function() {
        var clientYField = 'client' + (horizontal ? 'X' : 'Y');
        var heightField = horizontal ? 'width' : 'height';
        var topField = horizontal ? 'left' : 'top';

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
          var options = {target: element.children()[0]};
          options[clientYField] = 1;
          Dragstart.on(source).dragover(element, options);
          expect(element.scope().dragover.index).toBe(0);
          expect(angular.element(element.children()[0]).hasClass('dndPlaceholder')).toBe(true);
        });

        it('inserts before element if mouse is in first half', function() {
          var options = {target: element.children()[1]};
          var rect = options.target.getBoundingClientRect();
          options[clientYField] = rect[topField] + rect[heightField] / 2 - 1;
          Dragstart.on(source).dragover(element, options);
          expect(element.scope().dragover.index).toBe(1);
        });

        it('inserts after element if mouse is in second half', function() {
          var options = {target: element.children()[1]};
          var rect = options.target.getBoundingClientRect();
          options[clientYField] = rect[topField] + rect[heightField] / 2 + 1;
          Dragstart.on(source).dragover(element, options);
          expect(element.scope().dragover.index).toBe(2);
        });
      };
    }
  });

  describe('drop handler', function() {
    var source, element;

    beforeEach(function() {
      source = compileAndLink('<div dnd-draggable="{example: \'data\'}"></div>');
      element = createListWithItemsAndCallbacks();
    });

    it('inserts into the list and removes dndDragover class', function() {
      var dragover = Dragstart.on(source).dragover(element, {target: element.children()[0]});
      expect(element.hasClass("dndDragover")).toBe(true);
      dragover.drop(element);
      expect(element.scope().list).toEqual([1, {example: 'data'}, 2, 3]);
      expect(element.hasClass("dndDragover")).toBe(false);
      expect(element.children().length).toBe(3);
    });

    it('inserts in correct position', function() {
      Dragstart.on(source).dragover(element, {target: element.children()[1]}).drop(element);
      expect(element.scope().list).toEqual([1, 2, {example: 'data'}, 3]);
      expect(element.scope().inserted.index).toBe(2);
    });

    it('invokes the dnd-inserted callback', function() {
      Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().inserted.event).toEqual(jasmine.any(DragEventMock));
      expect(element.scope().inserted.index).toBe(3);
      expect(element.scope().inserted.external).toBe(false);
      expect(element.scope().inserted.type).toBeUndefined();
      expect(element.scope().inserted.item).toBe(element.scope().list[3]);
    });

    it('dnd-drop can transform the object', function() {
      var testObject = {transformed: true};
      element.scope().dropHandler = function(params) {
        expect(params.event).toEqual(jasmine.any(DragEventMock));
        expect(params.index).toBe(3);
        expect(params.external).toBe(false);
        expect(params.type).toBeUndefined();
        expect(params.item).toEqual({example: 'data'});
        return testObject;
      };
      Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().list[3]).toBe(testObject);
    });

    it('dnd-drop can cancel the drop', function() {
      element.scope().dropHandler = function() { return false; };
      var drop = Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().list).toEqual([1, 2, 3]);
      expect(element.scope().inserted).toBeUndefined();
      verifyDropCancelled(drop, element, true, 3);
    });

    it('dnd-drop can take care of inserting the element', function() {
      element.scope().dropHandler = function() { return true; };
      verifyDropAccepted(Dragstart.on(source).dragover(element).drop(element), element);
      expect(element.scope().list).toEqual([1, 2, 3]);
    });

    it('invokes callbacks with correct type', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
      Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().drop.type).toBe('mytype');
      expect(element.scope().inserted.type).toBe('mytype');
    });

    it('invokes callbacks for external elements', function() {
      var dragenter = Dragenter.validExternalOn(element);
      verifyDropAccepted(dragenter.dragover(element).drop(element), element);
      expect(element.scope().drop.external).toBe(true);
      expect(element.scope().inserted.external).toBe(true);
    });

    it('can handle Text mime type', function() {
      var dragenter = Dragenter.externalOn(element, {'Text': '{"lorem":"ipsum"}'});
      verifyDropAccepted(dragenter.dragover(element).drop(element), element);
      expect(element.scope().list[3]).toEqual({lorem: 'ipsum'});
    });

    it('cancels drop when JSON is invalid', function() {
      var dragenter = Dragenter.externalOn(element, {'text/plain': 'Lorem ipsum'});
      verifyDropCancelled(dragenter.dragover(element).drop(element), element, true, 3);
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
          var src = compileAndLink('<div dnd-draggable="{}" dnd-dragend="eff = dropEffect"></div>');
          var options = { dropEffect: dropEffect, effectAllowed: effectAllowed, ctrlKey: ctrlKey };
          Dragstart.on(src).dragover(element, options).drop(element).dragend(src);
          expect(src.scope().eff).toBe(expected);
        });
      }
    });
  });

  describe('dragleave handler', function() {
    var element, dragover;

    beforeEach(function() {
      element = createListWithItemsAndCallbacks();
      angular.element(document.body).append(element);

      dragover = Dragstart.on(compileAndLink('<div dnd-draggable="{}"></div>')).dragover(element);
      expect(element.hasClass('dndDragover')).toBe(true);
      expect(element.children().length).toBe(4);
    });

    afterEach(function() {
      element.remove();
    });

    it('removes the placeholder and dndDragover class', function() {
      var rect = element.children()[1].getBoundingClientRect();
      dragover.dragleave(element, {clientX: rect.left + 100, clientY: rect.top + 100});
      expect(element.hasClass('dndDragover')).toBe(false);
      expect(element.children().length).toBe(3);
    });

    it('does nothing if mouse is still inside dnd-list', function() {
      var rect = element.children()[1].getBoundingClientRect();
      dragover.dragleave(element, {clientX: rect.left + 2, clientY: rect.top + 2});
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
    var dragover = dragenter.dragover(element);
    verify(dragover, element);
    var dragover2 = dragover.dragover(element);
    verify(dragover2, element);
    var drop = dragover2.drop(element);
    verify(drop, element);
  }

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
