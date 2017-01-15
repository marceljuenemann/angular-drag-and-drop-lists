describe('dndList', function() {

  it('hides the placeholder element', function() {
    var element = compileAndLink('<dnd-list><img class="dndPlaceholder"></dnd-list>');
    expect(element.children().length).toBe(0);
  });

  it('disallows dropping if dnd-disable-if is true', function() {
    var source = compileAndLink('<div dnd-draggable="{}"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-disable-if="disabled"></div>');
    element.scope().disabled = true;
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropCancelled);
  });

  it('allows drop if dnd-disable-if is false', function() {
    var source = compileAndLink('<div dnd-draggable="{}"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-disable-if="disabled"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropAccepted);
  });

  it('disallows dropping from external sources', function() {
    var element = compileAndLink('<div dnd-list="[]"></div>');
    var dragenter = Dragenter.validExternalOn(element);
    forAllHandlers(dragenter, element, verifyDropCancelled);
  });

  it('allows dropping from external sources if dnd-external-sources is set', function() {
    var element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var dragenter = Dragenter.validExternalOn(element);
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  it('disallows drop without valid mime types', function() {
    var element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var dragenter = Dragenter.externalOn(element, {'text/plain': '{}'});
    forAllHandlers(dragenter, element, verifyDropCancelled);
  });

  // Old Internet Explorer versions don't have dataTransfer.types.
  it('allows drop if dataTransfer.types is undefined', function() {
    var element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var data = angular.toJson({item: {}, type: 'mytype'});
    var dragenter = Dragenter.externalOn(element, {'Text': data}, {undefinedTypes: true});
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  it('allows drop if dataTransfer.types contains "Text"', function() {
    var element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var data = angular.toJson({item: {}, type: 'mytype'});
    var dragenter = Dragenter.externalOn(element, {'Text': data});
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  it('allows drop if dataTransfer.types contains "application/json"', function() {
    var element = compileAndLink('<div dnd-list="[]" dnd-external-sources="true"></div>');
    var data = angular.toJson({item: {}, type: 'mytype'});
    var dragenter = Dragenter.externalOn(element, {'x-pdf': '{}', 'application/json': data});
    forAllHandlers(dragenter, element, verifyDropAccepted);
  });

  it('disallows dropping untyped elements if dnd-allowed-types is set', function() {
    var source = compileAndLink('<div dnd-draggable="{}"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropCancelled);
  });

  it('allows dropping typed elements if dnd-allowed-types is not set', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'sometype\'"></div>');
    var element = compileAndLink('<div dnd-list="[]"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropAccepted);
  });

  it('disallows dropping elements of the wrong type', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'othertype\'"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropCancelled);
  });

  it('allows dropping elements of the correct type', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'MyType\']"></div>');
    forAllHandlers(Dragstart.on(source).dragenter(element), element, verifyDropAccepted);
  });

  it('disallows dropping elements of the wrong type (test for Edge)', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'othertype\'"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    var dragstart = Dragstart.on(source, {allowedMimeTypes: ['text/plain', 'application/json']});
    forAllHandlers(dragstart.dragenter(element), element, verifyDropCancelled);
  });

  it('allows dropping elements of the correct type (test for Edge)', function() {
    var source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
    var element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'mytype\']"></div>');
    var dragstart = Dragstart.on(source, {allowedMimeTypes: ['text/plain', 'application/json']});
    forAllHandlers(dragstart.dragenter(element), element, verifyDropAccepted);
  });

  it('allows dropping external elements if correct type is encoded inside', function() {
    var element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'myType\']" ' +
                                 'dnd-external-sources="true"></div>');
    var data = angular.toJson({item: {}, type: 'mytype'});
    var dragenter = Dragenter.externalOn(element, {'application/json': data});
    forAllHandlers(dragenter, element, verifyDropAccepted);
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

    it('invokes dnd-dragover callback', function() {
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source).dragover(element);
      expect(element.scope().dragover.event).toEqual(jasmine.any(DragEventMock));
      expect(element.scope().dragover.index).toBe(3);
      expect(element.scope().dragover.external).toBe(false);
      expect(element.scope().dragover.type).toBeUndefined();
      expect(element.scope().dragover.item).toBeUndefined();
    });

    it('invokes dnd-dragover with correct type', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source).dragover(element);
      expect(element.scope().dragover.type).toBe('mytype');
      expect(element.scope().dragover.external).toBe(false);
    });

    it('invokes dnd-dragover with correct type (test for IE)', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source, {allowedMimeTypes: ['Text']}).dragover(element);
      expect(element.scope().dragover.type).toBe('mytype');
      expect(element.scope().dragover.external).toBe(false);
    });

    it('invokes dnd-dragover with correct type for external drops', function() {
      element = createListWithItemsAndCallbacks();
      Dragenter.externalOn(element, {'application/x-dnd-mytype': {}}).dragover(element);
      expect(element.scope().dragover.type).toBe('mytype');
      expect(element.scope().dragover.external).toBe(true);
    });

    it('invokes dnd-dragover with null type for external drops from IE', function() {
      element = createListWithItemsAndCallbacks();
      Dragenter.externalOn(element, {'Text': 'unaccessible'}).dragover(element);
      expect(element.scope().dragover.type).toBeNull();
      expect(element.scope().dragover.external).toBe(true);
    });

    it('invokes dnd-dragover with undefined callback', function() {
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source).dragover(element);
      expect(element.scope().dragover.callback).toBeUndefined();
    });

    it('invokes dnd-dragover with callback set on dragstart', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-callback="a*b"></div>');
      source.scope().a = 2;
      element = compileAndLink('<ul dnd-list="[]" dnd-dragover="result = callback({b: 3});"></ul>');
      Dragstart.on(source).dragover(element);
      expect(element.scope().result).toBe(6)
    });

    it('dnd-dragover callback can cancel the drop', function() {
      element = compileAndLink('<div dnd-list="list" dnd-dragover="false"></div>');
      verifyDropCancelled(Dragstart.on(source).dragover(element), element);
    });

    it('allows all external drops with Text mime type', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'myType\']" ' +
                               'dnd-external-sources="true"></div>');
      var dragenter = Dragenter.externalOn(element, {'Text': 'unaccessible'});
      verifyDropAccepted(dragenter.dragover(element), element);
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

    it('invokes dnd-drop with undefined callback', function() {
      element = createListWithItemsAndCallbacks();
      Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().drop.callback).toBeUndefined();
    });

    it('invokes dnd-drop with callback set on dragstart', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-callback="a*b"></div>');
      source.scope().a = 2;
      element = compileAndLink('<ul dnd-list="list" dnd-drop="callback({b: 3});"></ul>');
      element.scope().list = [];
      Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().list).toEqual([6])
    });

    it('invokes callbacks with correct type', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
      Dragstart.on(source).dragover(element).drop(element);
      expect(element.scope().drop.type).toBe('mytype');
      expect(element.scope().drop.external).toBe(false);
      expect(element.scope().inserted.type).toBe('mytype');
      expect(element.scope().inserted.external).toBe(false);
    });

    it('invokes callbacks with correct type for Edge', function() {
      source = compileAndLink('<div dnd-draggable="{}" dnd-type="\'mytype\'"></div>');
      Dragstart.on(source, {allowedMimeTypes: ['application/json']}).dragover(element).drop(element);
      expect(element.scope().drop.type).toBe('mytype');
      expect(element.scope().drop.external).toBe(false);
      expect(element.scope().inserted.type).toBe('mytype');
      expect(element.scope().inserted.external).toBe(false);
    });

    it('invokes callbacks with correct type for external elements', function() {
      var dragenter = Dragenter.externalOn(element, {'application/x-dnd-mytype': '{}'});
      verifyDropAccepted(dragenter.dragover(element).drop(element), element);
      expect(element.scope().drop.type).toBe('mytype');
      expect(element.scope().drop.external).toBe(true);
      expect(element.scope().inserted.type).toBe('mytype');
      expect(element.scope().inserted.external).toBe(true);
    });

    it('invokes callbacks with correct type for external elements (test for Edge)', function() {
      var data = angular.toJson({item: [1, 2, 3], type: 'mytype'});
      var dragenter = Dragenter.externalOn(element, {'application/json': data});
      verifyDropAccepted(dragenter.dragover(element).drop(element), element);
      expect(element.scope().drop.type).toBe('mytype');
      expect(element.scope().drop.external).toBe(true);
      expect(element.scope().inserted.type).toBe('mytype');
      expect(element.scope().inserted.external).toBe(true);
      expect(element.scope().inserted.item).toEqual([1, 2, 3]);
    });

    it('disallows drops with wrong type encoded inside (test for Edge)', function() {
      element = compileAndLink('<div dnd-list="[]" dnd-allowed-types="[\'myType\']" ' +
                               'dnd-external-sources="true"></div>');
      var data = angular.toJson({item: [], type: 'othertype'});
      var dragenter = Dragenter.externalOn(element, {'application/json': data});
      verifyDropCancelled(dragenter.dragover(element).drop(element), element, true);
    });

    it('cancels drop when JSON is invalid', function() {
      var dragenter = Dragenter.externalOn(element, {'application/x-dnd': 'Lorem ipsum'});
      verifyDropCancelled(dragenter.dragover(element).drop(element), element, true, 3);
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
      var rect = element[0].getBoundingClientRect();
      dragover.dragleave(element, {clientX: rect.left - 2, clientY: rect.top - 2});
      expect(element.hasClass('dndDragover')).toBe(false);
      expect(element.children().length).toBe(3);
    });

    it('removes the placeholder and dndDragover if child placeholder is already set', function() {
      var rect = element[0].getBoundingClientRect();
      dragover.dragleave(element, {clientX: rect.left + 2, clientY: rect.top + 2, phShown: true});
      expect(element.hasClass('dndDragover')).toBe(false);
      expect(element.children().length).toBe(3);
    });

    it('sets _dndPhShown if mouse is still inside', function() {
      var rect = element[0].getBoundingClientRect();
      var result = dragover.dragleave(element, {clientX: rect.left + 2, clientY: rect.top + 2});
      expect(element.hasClass('dndDragover')).toBe(true);
      expect(element.children().length).toBe(4);
      expect(result.dndPhShownSet).toBe(true);
    });
  });

  describe('dropEffect', function() {
    // This matrix shows the expected drop effect, given two effectAllowed values.
    var ALL = [  'all',  'move', 'copy', 'link', 'copyLink', 'copyMove', 'linkMove'];
    var EXPECTED_MATRIX = {
      move:     ['move', 'move', 'none', 'none', 'none',     'move',     'move'],
      copy:     ['copy', 'none', 'copy', 'none', 'copy',     'copy',     'none'],
      link:     ['link', 'none', 'none', 'link', 'link',     'none',     'link'],
      copyLink: ['copy', 'none', 'copy', 'link', 'copy',     'copy',     'link'],
      copyMove: ['move', 'move', 'copy', 'none', 'copy',     'move',     'move'],
      linkMove: ['move', 'move', 'none', 'link', 'link',     'move',     'move'],
      all:      ['move', 'move', 'copy', 'link', 'copy',     'move',     'move'],
      '':       ['move', 'move', 'copy', 'link', 'copy',     'move',     'move'],
    };
    angular.forEach(ALL, function(sourceEffectAllowed, index) {
      angular.forEach(EXPECTED_MATRIX, function(expected, targetEffectAllowed) {
        expected = expected[index];
        it('is ' + expected + ' for effect-allowed ' + sourceEffectAllowed
            + ' and ' + targetEffectAllowed, function() {
          var src = compileAndLink('<div dnd-draggable="{}" dnd-dragend="result = dropEffect" '
                                 + 'dnd-effect-allowed="' + sourceEffectAllowed + '"></div>');
          var target = createListWithItemsAndCallbacks(false, targetEffectAllowed);
          expect(Dragstart.on(src).effectAllowed).toBe(sourceEffectAllowed);
          if (expected != 'none') {
            // Verify dragover.
            expect(Dragstart.on(src).dragover(target).dropEffect).toBe(expected);
            expect(target.scope().dragover.dropEffect).toBe(expected);
            // Verify drop.
            expect(Dragstart.on(src).dragover(target).drop(target).dropEffect).toBe(expected);
            expect(target.scope().drop.dropEffect).toBe(expected);
            // Verify dragend.
            Dragstart.on(src).dragover(target).drop(target).dragend(src);
            expect(src.scope().result).toBe(expected);
          } else {
            verifyDropCancelled(Dragstart.on(src).dragover(target), target, false, 3);
            verifyDropCancelled(Dragstart.on(src).dragover(target).drop(target), target, true, 3);
            Dragstart.on(src).dragend(src);
            expect(src.scope().result).toBe('none');
          }
        });
      });
    });

    // In Safari dataTransfer.effectAllowed is always 'all', ignoring the value set in dragstart.
    it('is determined from internal state in Safari', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="link"></div>');
      var target = createListWithItemsAndCallbacks(false, 'copyLink');
      var options = {effectAllowed: 'all'};
      Dragstart.on(src).dragover(target, options).drop(target, options);
      expect(target.scope().dragover.dropEffect).toBe('link');
      expect(target.scope().drop.dropEffect).toBe('link');
    });

    // On MacOS, modifiers automatically limit the effectAllowed passed to dragover and drop.
    it('is limited by modifier keys on MacOS', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="all"></div>');
      var target = createListWithItemsAndCallbacks();
      Dragstart.on(src).dragover(target, {effectAllowed: 'copyLink'}).drop(target);
      expect(target.scope().dragover.dropEffect).toBe('copy');
      expect(target.scope().drop.dropEffect).toBe('copy');
    });

    it('is copy if Ctrl key is pressed', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="all"></div>');
      var target = createListWithItemsAndCallbacks();
      Dragstart.on(src).dragover(target, {ctrlKey: true}).drop(target);
      expect(target.scope().dragover.dropEffect).toBe('copy');
      expect(target.scope().drop.dropEffect).toBe('copy');
    });

    it('is link if Alt key is pressed', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="all"></div>');
      var target = createListWithItemsAndCallbacks();
      Dragstart.on(src).dragover(target, {altKey: true}).drop(target);
      expect(target.scope().dragover.dropEffect).toBe('link');
      expect(target.scope().drop.dropEffect).toBe('link');
    });

    it('ignores Ctrl key if copy is not possible', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="linkMove"></div>');
      var target = createListWithItemsAndCallbacks();
      Dragstart.on(src).dragover(target, {ctrlKey: true}).drop(target);
      expect(target.scope().dragover.dropEffect).toBe('move');
      expect(target.scope().drop.dropEffect).toBe('move');
    });

    it('respects effectAllowed from external drops', function() {
      var target = createListWithItemsAndCallbacks();
      Dragenter.validExternalOn(target, {effectAllowed: 'copyLink'}).dragover(target).drop(target);
      expect(target.scope().dragover.dropEffect).toBe('copy');
      expect(target.scope().drop.dropEffect).toBe('copy');
    });

    it('respects effectAllowed from external drops in IE', function() {
      var target = createListWithItemsAndCallbacks();
      Dragenter.externalOn(target, {'Text': '{}'}, {effectAllowed: 'copyLink'})
               .dragover(target).drop(target);
      expect(target.scope().dragover.dropEffect).toBe('move');
      expect(target.scope().drop.dropEffect).toBe('move');
    });

    it('ignores effectAllowed from internal drops in IE', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="copyLink"></div>');
      var target = createListWithItemsAndCallbacks();
      Dragstart.on(src, {allowedMimeTypes: ['Text']}).dragover(target, {altKey: true});
      expect(target.scope().dragover.dropEffect).toBe('link');
    });

    it('does not set dropEffect in IE', function() {
      var src = compileAndLink('<div dnd-draggable="{}" dnd-effect-allowed="copyLink"></div>');
      var target = createListWithItemsAndCallbacks();
      var dragover = Dragstart.on(src, {allowedMimeTypes: ['Text']}).dragover(target);
      expect(dragover.dropEffect).toBeUndefined();
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
    expect(result.dropEffect).toBeUndefined();
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

  function createListWithItemsAndCallbacks(horizontal, effectAllowed) {
    var params = '{event: event, dropEffect: dropEffect, index: index, '
               + 'item: item, external: external, type: type, callback: callback}';
    var element = compileAndLink('<ul dnd-list="list" dnd-external-sources="true" ' +
                  'dnd-horizontal-list="' + (horizontal || 'false') + '" ' +
                  (effectAllowed ? 'dnd-effect-allowed="' + effectAllowed + '" ' : '') +
                  'dnd-dragover="dragover = ' + params + '" ' +
                  'dnd-drop="dropHandler(' + params + ')" ' +
                  'dnd-inserted="inserted = ' + params + '">' +
                  '<li>A</li><li>B</li><li>C</li></ul>');
    element.scope().dropHandler = function(params) {
      element.scope().drop = params;
      return params.item;
    };
    element.scope().list = [1, 2, 3];
    return element;
  }
});
