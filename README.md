angular-drag-and-drop-lists
===========================
Angular directives that allow you to build sortable lists with the native HTML5 drag & drop API. The directives can also be nested to bring drag & drop to your WYSIWYG editor, your tree, or whatever fancy structure you are building.

## This is a fork
This is a fork from the [original angular-drag-and-drop-lists](https://github.com/marceljuenemann/angular-drag-and-drop-lists).

## Demo
* [Nested Lists](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/nested)
* [Simple Lists](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/simple)
* [Typed Lists](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)
* [Advanced Features](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* [Multiselection Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/multi)


## Supported browsers

**Touch devices are not supported**, because they do not implement the HTML5 drag & drop standard. However, you can use a [shim](https://github.com/timruffles/ios-html5-drag-drop-shim) to make it work on touch devices as well.

Internet Explorer 8 or lower is *not supported*, but all modern browsers are (see changelog for list of tested browsers).


## Download & Installation
* Download `angular-drag-and-drop-lists.js` (or the minified version) and include it in your application.
* OR use bower : `bower install angular-drag-and-drop-lists-spiria`
* OR use npm : `npm install angular-drag-and-drop-lists-spiria`
* Add the `dndLists` module as a dependency to your angular app : `angular.module('yourAppName', ['dndLists']);`

## dnd-draggable directive
Use the dnd-draggable directive to make your element draggable

**Attributes**
* `dnd-draggable` Required attribute. The value has to be an object that represents the data of the element. In case of a drag and drop operation the object will be serialized and unserialized on the receiving end.
* `dnd-effect-allowed` Use this attribute to limit the operations that can be performed. Valid options are `move`, `copy` and `link`, as well as `all`, `copyMove`, `copyLink` and `linkMove`, while `move` is the default value. The semantics of these operations are up to you and have to be implemented using the callbacks described below. If you allow multiple options, the user can choose between them by using the modifier keys (OS specific). The cursor will be changed accordingly, expect for IE and Edge, where this is not supported. Note that the implementation of this attribute is very buggy in IE9. This attribute works together with `dnd-external-sources` except on Safari and IE, where the restriction will be lost when dragging accross browser tabs. [Design document](https://github.com/marceljuenemann/angular-drag-and-drop-lists/wiki/Drop-Effects-Design) [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-type` Use this attribute if you have different kinds of items in your application and you want to limit which items can be dropped into which lists. Combine with dnd-allowed-types on the dnd-list(s). This attribute must be a lower case string. Upper case characters can be used, but will be converted to lower case automatically. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)
* `dnd-disable-if` You can use this attribute to dynamically disable the draggability of the element. This is useful if you have certain list items that you don't want to be draggable, or if you want to disable drag & drop completely without having two different code branches (e.g. only allow for admins). [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)

**Callbacks**
* `dnd-dragstart` Callback that is invoked when the element was dragged. The original dragstart event will be provided in the local `event` variable. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-moved` Callback that is invoked when the element was moved. Usually you will remove your element from the original list in this callback, since the directive is not doing that for you automatically. The original dragend event will be provided in the local `event` variable. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-copied` Same as dnd-moved, just that it is called when the element was copied instead of moved. The original dragend event will be provided in the local `event` variable. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-linked` Same as dnd-moved, just that it is called when the element was linked instead of moved. The original dragend event will be provided in the local `event` variable. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-canceled` Callback that is invoked if the element was dragged, but the operation was canceled and the element was not dropped. The original dragend event will be provided in the local event variable. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-dragend` Callback that is invoked when the drag operation ended. Available local variables are `event` and `dropEffect`. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-selected` Callback that is invoked when the element was clicked but not dragged. The original click event will be provided in the local `event` variable. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/nested)
* `dnd-callback` Custom callback that is passed to dropzone callbacks and can be used to communicate between source and target scopes. The dropzone can pass user defined variables to this callback. This can be used to transfer objects without serialization, see [Demo](https://jsfiddle.net/Ldxffyod/1/).

**CSS classes**
* `dndDragging` This class will be added to the element while the element is being dragged. It will affect both the element you see while dragging and the source element that stays at it's position. Do not try to hide the source element with this class, because that will abort the drag operation.
* `dndDraggingSource` This class will be added to the element after the drag operation was started, meaning it only affects the original element that is still at it's source position, and not the "element" that the user is dragging with his mouse pointer

## dnd-list directive

Use the dnd-list attribute to make your list element a dropzone. Usually you will add a single li element as child with the ng-repeat directive. If you don't do that, we will not be able to position the dropped element correctly. If you want your list to be sortable, also add the dnd-draggable directive to your li element(s).

**Attributes**
* `dnd-list` Required attribute. The value has to be the array in which the data of the dropped element should be inserted. The value can be blank if used with a custom dnd-drop handler that handles the insertion on its own.
* `dnd-allowed-types` Optional array of allowed item types. When used, only items that had a matching dnd-type attribute will be dropable. Upper case characters will automatically be converted to lower case. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)
* `dnd-effect-allowed` Optional string expression that limits the drop effects that can be performed on the list. See dnd-effect-allowed on dnd-draggable for more details on allowed options. The default value is `all`.
* `dnd-disable-if` Optional boolean expression. When it evaluates to true, no dropping into the list is possible. Note that this also disables rearranging items inside the list. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)
* `dnd-horizontal-list` Optional boolean expression. When it evaluates to true, the positioning algorithm will use the left and right halfs of the list items instead of the upper and lower halfs. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-external-sources` Optional boolean expression. When it evaluates to true, the list accepts drops from sources outside of the current browser tab, which allows to drag and drop accross different browser tabs. The only major browser for which this is currently not working is Microsoft Edge. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)

**Callbacks**
* `dnd-dragover` Optional expression that is invoked when an element is dragged over the list. If the expression is set, but does not return true, the element is not allowed to be dropped. The following variables will be available:
    * `event` The original dragover event sent by the browser.
    * `index` The position in the list at which the element would be dropped.
    * `type` The `dnd-type` set on the dnd-draggable, or undefined if unset. Will be null for drops from external sources in IE and Edge, since we don't know the type in those cases.
    * `external` Whether the element was dragged from an external source. See `dnd-external-sources`.
    * `dropEffect` The dropEffect that is going to be performed, see dnd-effect-allowed.
    * `callback` If dnd-callback was set on the source element, this is a function reference to the callback. The callback can be invoked with custom variables like this: `callback({var1: value1, var2: value2})`. The callback will be executed on the scope of the source element. If dnd-external-sources was set and external is true, this callback will not be available.
    * [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)
* `dnd-drop` Optional expression that is invoked when an element is dropped on the list. The same variables as for dnd-dragover will be available, with the exception that type is always known and therefore never null. There will also be an `item` variable, which is the transferred object. The return value determines the further handling of the drop:
    * `falsy` The drop will be canceled and the element won't be inserted.
    * `true` Signalises that the drop is allowed, but the dnd-drop callback will take care of inserting the element.
    * Otherwise: All other return values will be treated as the object to insert into the array. In most cases you simply want to return the `item` parameter, but there are no restrictions on what you can return.
* `dnd-inserted` Optional expression that is invoked after a drop if the element was actually inserted into the list. The same local variables as for `dnd-drop` will be available. Note that for reorderings inside the same list the old element will still be in the list due to the fact that `dnd-moved` was not called yet. [Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/advanced)

**CSS classes**
* `dndPlaceholder` When an element is dragged over the list, a new placeholder child element will be added. This element is of type `li` and has the class `dndPlaceholder` set. Alternatively, you can define your own placeholder by creating a child element with `dndPlaceholder` class.
* `dndDragover` This class will be added to the list while an element is being dragged over the list.

## dnd-nodrag directive

Use the `dnd-nodrag` attribute inside of `dnd-draggable` elements to prevent them from starting drag operations. This is especially useful if you want to use input elements inside of `dnd-draggable` elements or create specific handle elements.

**Note:** This directive does not work in Internet Explorer 9.

[Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)

## dnd-handle directive

Use the `dnd-handle` directive within a `dnd-nodrag` element in order to allow dragging of that element after all. Therefore, by combining `dnd-nodrag` and `dnd-handle` you can allow `dnd-draggable` elements to only be dragged via specific *handle* elements.

**Note:** Internet Explorer will show the handle element as drag image instead of the `dnd-draggable` element. You can work around this by styling the handle element differently when it is being dragged. Use the CSS selector `.dndDragging:not(.dndDraggingSource) [dnd-handle]` for that.

[Demo](http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/types)

## Recommended CSS styles
It is recommended that you apply the following CSS styles:

* If your application is about moving elements by drag and drop, it is recommended that you hide the source element while dragging, i.e. setting `display: none` on the `.dndDraggingSource` class.
* If your application allows to drop elements into empty lists, you need to ensure that empty lists never have a height or width of zero, e.g. by setting a `min-width`.
* You should style the `.dndPlaceholder` class accordingly.

**Note:** Previous versions of this directive required `postion: relative` on certain elements, but this is no longer required.

## Why another drag & drop library?
There are tons of other drag & drop libraries out there, but none of them met my three requirements:

* **Angular:** If you use angular.js, you really don't want to throw a bunch of jQuery into your app. Instead you want to use libraries that were built the "angular way" and support **two-way data binding** to update your data model automatically.
* **Nested lists:** If you want to build a **WYSIWYG editor** or have some fancy **tree structure**, the library has to support nested lists.
* **HTML5 drag & drop:** Most drag & drop applications you'll find on the internet use pure JavaScript drag & drop. But with the arrival of HTML5 we can delegate most of the work to the browser. For example: If you want to show the user what they are currently dragging, you'll have to update the position of the element all the time and set it below the mouse pointer. In HTML5 the browser will do that for you! But you can not only save code lines, you can also offer a more **native user experience**: If you click on an element in a pure JavaScript drag & drop implementation, it will usually start the drag operation. But remember what happens when you click an icon on your desktop: The icon will be selected, not dragged! This is the native behaviour you can bring to your web application with HTML5.

If this doesn't fit your requirements, check out one of the other awesome drag & drop libraries:

* [angular-ui-tree](https://github.com/JimLiu/angular-ui-tree): Very similar to this library, but does not use the HTML5 API. Therefore you need to write some more markup to see what you are dragging and it will create another DOM node that you have to style. However, if you plan to support touch devices this is probably your best choice.
* [angular-dragdrop](https://github.com/angular-dragdrop/angular-dragdrop): One of many libraries with the same name. This one uses the HTML5 API, but if you want to build (nested) sortable lists, you're on your own, because it does not calculate the correct element position for you.
* [more...](https://www.google.de/search?q=angular+drag+and+drop)


## License

Copyright (c) 2014 [Marcel Juenemann](mailto:marcel@juenemann.cc)

Copyright (c) 2014-2017 Google Inc.

This is not an official Google product (experimental or otherwise), it is just code that happens to be owned by Google.

[MIT License](https://raw.githubusercontent.com/marceljuenemann/angular-drag-and-drop-lists/master/LICENSE)
