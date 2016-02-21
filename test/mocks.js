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
    this.$results.data = {};
  }

  set effectAllowed(value) {
    this.$results.effectAllowed = value;
  }

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
    this.$effectAllowed = options.effectAllowed || 'move';
    this.$types = options.undefinedTypes ? undefined : Object.keys(data);
  }

  set dropEffect(value) { this.$results.dropEffect = value; }
  get effectAllowed() { return this.$effectAllowed; }
  get types() { return this.$types; }
}

class DropDataTransfer extends DropzoneDataTransfer {
  getData(format) {
    if (this.$types && !this.$types.includes(format)) throw "Invalid format " + format;
    return this.$data[format];
  }
}

class DragEventMock {
  constructor(type, dataTransfer, options) {
    this.$type = type;
    this.$dataTransfer = dataTransfer;
    this.$options = options;
    this.$results = {dataTransfer: dataTransfer.getResults()};
  }

  get originalEvent() { return this; }
  get dataTransfer() { return this.$dataTransfer; }
  get target() { return this.$options.target || undefined; }
  get type() { return this.$type; }
  get _dndHandle() { return this.$options.dndHandle || undefined; }

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
  get returnValue() { return this.$results.returnValue; }
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
    return new Dragenter(element, this.$results.dataTransfer.data, opt_options || {});
  }

  static on(element, opt_options) {
    return new Dragstart(element, opt_options || {});
  }
}

class DropzoneEventResult extends DragEventResult {
  constructor(element, type, data, dataTransfer, options) {
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
    return Dragenter.externalOn(element, {'Text': '{"hello":"world"}'}, opt_options);
  }
}

class Dragover extends DropzoneEventResult {
  constructor(element, data, options) {
    super(element, 'dragover', data, new DropzoneDataTransfer(data, options), options);
  }

  drop(element) {
    return new Drop(element, this.$originalData, this.$options);
  }
}

class Drop extends DropzoneEventResult {
  constructor(element, data, options) {
    super(element, 'drop', data, new DropDataTransfer(data, options), options);
  }
}
