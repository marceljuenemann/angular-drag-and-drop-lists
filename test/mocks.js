"use strict";

class DataTransferMock {
  constructor() { this.$results = {}; }
  get dropEffect() { throw "Unexcepted dropEffect getter invocation"; }
  set dropEffect(value) { throw "Unexcepted dropEffect setter invocation"; }
  get effectAllowed() { throw "Unexcepted effectAllowed getter invocation"; }
  set effectAllowed(value) { throw "Unexcepted effectAllowed setter invocation"; }
  get types() { throw "Unexcepted types getter invocation"; }
  set types(value) { throw "Unexcepted types setter invocation"; }
  getData() { throw "Unexcepted getData invocation"; }
  setData() { throw "Unexcepted setData invocation"; }
  setDragImage() { throw "Unexcepted setDragImage invocation"; }
  getResults() { return this.$results; }
}

class DragstartDataTransfer extends DataTransferMock {
  constructor(options) {
    super();
    this.$allowSetDragImage = options.allowSetDragImage || false;
    this.$allowedMimeTypes = options.allowedMimeTypes || null;
    this.$presetTypes = options.presetTypes || [];
    this.$results.data = {};
  }

  get effectAllowed() { throw "Unexcepted effectAllowed getter invocation"; }
  set effectAllowed(value) { this.$results.effectAllowed = value; }
  get types() { return this.$presetTypes; }
  set types(value) { throw "Unexcepted types setter invocation"; }

  setData(format, data) {
    if (this.$allowedMimeTypes && !this.$allowedMimeTypes.includes(format)) {
      throw "Invalid mime type " + format;
    }
    this.$results.data[format] = data;
  }

  setDragImage(img) {
    if (!this.$allowSetDragImage) throw "Unexcepted setDragImage invocation";
    this.$results.dragImage = img;
  }
}

class DropzoneDataTransfer extends DataTransferMock {
  constructor(data, options) {
    super();
    this.$data = data;
    this.$dropEffect = options.dropEffect || 'move';
    this.$effectAllowed = options.effectAllowed || 'move';
    this.$types = options.undefinedTypes ? undefined : Object.keys(data);
  }

  get dropEffect() { throw "Unexcepted dropEffect getter invocation"; }
  set dropEffect(value) { this.$results.dropEffect = value; }
  get effectAllowed() { return this.$effectAllowed; }
  set effectAllowed(value) { throw "Unexcepted effectAllowed setter invocation"; }
  get types() { return this.$types; }
  set types(value) { throw "Unexcepted types setter invocation"; }
}

class DropDataTransfer extends DropzoneDataTransfer {
  getData(format) { return this.$data[format]; }
}

class DragEventMock {
  constructor(type, dataTransfer, options) {
    this.$type = type;
    this.$dataTransfer = dataTransfer;
    this.$options = options;
    this.$results = {dataTransfer: dataTransfer.getResults()};
  }

  get clientX() { return this.$options.clientX || 0; }
  get clientY() { return this.$options.clientY || 0; }
  get ctrlKey() { return this.$options.ctrlKey || false; }
  get altKey() { return this.$options.altKey || false; }
  get dataTransfer() { return this.$dataTransfer; }
  get originalEvent() { return this; }
  get target() { return this.$options.target || undefined; }
  get type() { return this.$type; }
  get _dndHandle() { return this.$options.dndHandle || undefined; }
  get _dndPhShown() { return this.$options.phShown || undefined; }
  set _dndPhShown(value) { this.$results.setDndPhShown = value; }

  preventDefault() { this.$results.invokedPreventDefault = true; }
  stopPropagation() { this.$results.invokedStopPropagation = true; }
  getResults() { return this.$results; }
}

class DragEventResult {
  constructor(element, type, dataTransfer, opt_eventOptions) {
    let handler = $._data($(element).get(0), "events")[type][0].handler;
    let event = new DragEventMock(type, dataTransfer, opt_eventOptions || {});
    this.$results = event.getResults();
    this.$results.returnValue = handler(event);
    this.$type = type;
  }

  get propagationStopped() { return !!this.$results.invokedStopPropagation; }
  get defaultPrevented() { return !!this.$results.invokedPreventDefault; }
  get dndPhShownSet() { return this.$results.setDndPhShown || false; }
  get returnValue() { return this.$results.returnValue; }
  get dropEffect() { return this.$results.dataTransfer.dropEffect; }
  get type() { return this.$type; }
}

class Dragstart extends DragEventResult {
  constructor(element, options) {
    super(element, 'dragstart', new DragstartDataTransfer(options), options);
  }

  get data() { return this.$results.dataTransfer.data; }
  get dragImage() { return this.$results.dataTransfer.dragImage; }
  get effectAllowed() { return this.$results.dataTransfer.effectAllowed; }

  dragenter(element, opt_options) {
    var options = $.extend({effectAllowed: this.effectAllowed}, opt_options);
    return new Dragenter(element, this.$results.dataTransfer.data, options);
  }

  dragover(element, opt_options) {
    return this.dragenter(element, opt_options).dragover(element);
  }

  dragend(element) {
    return Dragend.on(element);
  }

  static on(element, opt_options) {
    return new Dragstart(element, opt_options || {});
  }
}

class Dragend extends DragEventResult {
  constructor(element, options) {
    super(element, 'dragend', new DataTransferMock(), options);
  }

  static on(element, opt_options) {
    return new Dragend(element, opt_options || {});
  }
}

class DropzoneEventResult extends DragEventResult {
  constructor(element, type, data, dataTransfer, options) {
    options.target = options.target || element[0];
    super(element, type, dataTransfer, options);
    this.$originalData = $.extend({}, data);
    this.$options = options;
  }

  dragover(element, opt_options) {
    return new Dragover(element, this.$originalData, $.extend({}, this.$options, opt_options));
  }
}

class Dragenter extends DropzoneEventResult {
  constructor(element, data, options) {
    super(element, 'dragenter', data, new DropzoneDataTransfer(data, options), options);
  }

  static externalOn(element, data, opt_options) {
    return new Dragenter(element, data, opt_options || {});
  }

  static validExternalOn(element, opt_options) {
    return Dragenter.externalOn(element, {'application/x-dnd': '{"hello":"world"}'}, opt_options);
  }
}

class Dragover extends DropzoneEventResult {
  constructor(element, data, options) {
    super(element, 'dragover', data, new DropzoneDataTransfer(data, options), options);
  }

  dragleave(element, opt_options) {
    return new Dragleave(element, this.$originalData, $.extend({}, this.$options, opt_options));
  }

  drop(element, opt_options) {
    return new Drop(element, this.$originalData, $.extend({}, this.$options, opt_options));
  }
}

class Dragleave extends DropzoneEventResult {
  constructor(element, data, options) {
    super(element, 'dragleave', data, new DataTransferMock(), options);
  }
}

class Drop extends DropzoneEventResult {
  constructor(element, data, options) {
    super(element, 'drop', data, new DropDataTransfer(data, options), options);
  }

  dragend(element) {
    return Dragend.on(element);
  }
}
