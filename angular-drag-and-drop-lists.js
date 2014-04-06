/**
 * angular-drag-and-drop-lists v1.0.0
 *
 * Copyright (c) 2014 Marcel Juenemann mail@marcel-junemann.de
 * https://github.com/marceljuenemann/angular-drag-and-drop-lists
 *
 * License: MIT
 */
angular.module('dndLists', [])

    /**
     * Use the dnd-draggable attribute to make your element draggable
     *
     * Attributes:
     * - dnd-draggable      Required attribute. The value has to be an object that represents the data
     *                      of the element. In case of a drag and drop operation the object will be
     *                      serialized and unserialized on the receiving end.
     * - dnd-effect-allowed Use this attribute to limit the operations that can be performed. By default
     *                      the user can use the Ctrl and Shift key to switch from a move to a copy
     *                      or link operation. Typical values include "move", "copy" or "copyMove",
     *                      where the last one allows the copy and move operation.
     * - dnd-moved          Callback that is invoked when the element was dragged away. Usually you
     *                      will remove your element from the original list in this callback, since
     *                      the directive is not doing that for you.
     * - dnd-copied         Same as dnd-moved, just that it is called when the element was copied
     *                      instead of moved.
     * - dnd-selected       Callback that is invoked when the element was clicked but not dragged
     *
     * CSS classes:
     * - dndDragging        This class will be added to the element while the element is being dragged.
     *                      It will affect both the element you see while dragging and the source
     *                      element that stays at it's position. Do not try to hide the source element
     *                      with this class, because that will abort the drag operation.
     * - dndDraggingSource  This class will be added to the element after the drag operation was started,
     *                      meaning it only affects the original element that is still at it's source
     *                      position, and not the "element" that the user is dragging with his mouse pointer
     */
    .directive('dndDraggable', function($parse, $timeout) {
        return function(scope, element, attr) {
            // Set the HTML5 draggable attribute on the element
            element.attr("draggable", "true");

            /**
             * When the drag operation is started we have to prepare the dataTransfer object,
             * which is the only way we communicate with the target element
             */
            element.on('dragstart', function(event) {
                // Serialize the data associated with this element
                // The key has no special meaning, but it has to be the same as on the receiving end
                event.dataTransfer.setData("json", angular.toJson(scope.$eval(attr.dndDraggable)));

                // Only allow actions specified in dnd-effect-allowed attribute
                // Typical values include "move", "copy" and "copyMove"
                event.dataTransfer.effectAllowed = attr.dndEffectAllowed;

                // Add the dndDragging class to the element being dragged. This class will affect both
                // the element you see while dragging and the source element that stays at it's position.
                // Do not try to hide the source element with the dndDragging class, because this
                // will abort the drag operation. Instead use the dndDraggingSource class, which will
                // only be applied to the source element, not to the element you see below your mouse
                // pointer while dragging
                element.addClass("dndDragging");
                $timeout(function() { element.addClass("dndDraggingSource"); }, 0);

                event.stopPropagation();
            });

            /**
             * The dragend event is triggered when the element was dropped or when the drag
             * operation was aborted (e.g. hit escape button). Depending on the executed action
             * we will invoke the callbacks specified with the dnd-moved or dnd-copied attribute.
             */
            element.on('dragend', function(event) {
                scope.$apply(function() {
                    switch (event.dataTransfer.dropEffect) {
                        case "move":
                            $parse(attr.dndMoved)(scope);
                            break;

                        case "copy":
                            $parse(attr.dndCopied)(scope);
                            break;
                    }
                });

                element.removeClass("dndDragging");
                element.removeClass("dndDraggingSource");
                event.stopPropagation();
            });

            /**
             * When the element is clicked we invoke the callback function
             * specified with the dnd-selected attribute.
             */
            element.on('click', function(event) {
                scope.$apply(function() {
                    $parse(attr.dndSelected)(scope);
                });

                event.stopPropagation();
            });
        };
    })

    /**
     * Use the dnd-list attribute to make your list element a dropzone. If you care about correct positioning
     * of your list elements, you have to add a li child element with the ng-repeat directive. If you want
     * your list to be sortable, also add the dnd-draggable directive to your li element.
     *
     * Attributes:
     * - dnd-list           Required attribute. The value has to be the array in which the data of the
     *                      dropped element should be inserted.
     *
     * CSS classes:
     * - dndPlaceholder     When an element is dragged over the list, a new placeholder child element will be
     *                      added. This element is of type li and has the class dndPlaceholder set.
     * - dndDragover        This class will be added to the list while an element is being dragged over the list.
     */
    .directive('dndList', function($timeout) {
        return function(scope, element, attr) {
            // While an element is dragged over the list, this placeholder element is inserted
            // at the location where the element would be inserted after dropping
            var placeholder = angular.element("<li class='dndPlaceholder'></li>");
            var placeholderNode = placeholder[0];
            var listNode = element[0];

            /**
             * The dragover event is triggered "every few hundred milliseconds" while an element
             * is being dragged over our list, or over an child element.
             */
            element.on('dragover', function(event) {
                // If the drag operation was not started by our directive, we ignore the event
                if (Array.prototype.indexOf.call(event.dataTransfer.types, "json") === -1) {
                    return true;
                }

                if (event.target.parentNode === listNode) {
                    // The element is being dragged over one of our child nodes. Now we have
                    // to decide at which position to show the placeholder: If the mouse pointer
                    // is in the upper half of the child element, we place it before the child
                    // element, otherwise below it
                    var beforeOrAfter = event.offsetY < event.target.offsetHeight / 2;
                    listNode.insertBefore(placeholderNode, beforeOrAfter ? event.target : event.target.nextSibling);
                } else if (placeholderNode.parentNode != listNode) {
                    // This branch is reached when the element is being dragged directly over the
                    // list element, and not over a child. This should mostly happen if the list
                    // is empty. In this case we just put the placeholder in the end.
                    element.append(placeholder);
                }

                element.addClass("dndDragover");
                event.preventDefault();
                event.stopPropagation();
            });

            /**
             * We have to remove the placeholder when the element is no longer being dragged over our list.
             * The problem is that the dragleave event is not only fired when the element leaves our list,
             * but also when it leaves a child element -- so practically it's fired all the time. As a
             * workaround we wait a few milliseconds and then check if the dndDragover class was added
             * again. If it is there, dragover must have been called in the meantime, i.e. the element
             * is still dragging over the list. If you know a better way of doing this, please tell me!
             */
            element.on('dragleave', function(event) {
                element.removeClass("dndDragover");
                $timeout(function() {
                    if (!element.hasClass("dndDragover")) {
                        placeholder.remove();
                    }
                }, 100);
            });

            /**
             * When the element is dropped, we use the position of the placeholder element as the
             * position where we insert the transferred data. This assumes that the list has exactly
             * one child element per array element.
             */
            element.on('drop', function(event) {
                // Unserialize the data that was serialized in dragstart
                var transferredObject = JSON.parse(event.dataTransfer.getData("json"));

                // Retrieve the JSON array in which we are going to insert the transferred object
                var targetArray = scope.$eval(attr.dndList);

                // We use the position of the placeholder node to determine at which
                // position of the array we will insert the object
                var placeholderIndex = Array.prototype.indexOf.call(listNode.children, placeholderNode);
                scope.$apply(function() {
                    targetArray.splice(placeholderIndex, 0, transferredObject);
                });

                placeholder.remove();
                element.removeClass("dndDragover");
                event.preventDefault();
                event.stopPropagation();
            });
        };
    });
