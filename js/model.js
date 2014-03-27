/* Width is x, depth is y, and height is z. The blocks array looks like this:

  x -> 
y 0 1 2
| 3 4 5
v 6 7 8

The pattern then continues for each z coordinate. */

function Model(w, d, h) {
  this.width = w;
  this.depth = d;
  this.height = h;
  this.initTypedArray();
  this.blockListeners = [];
  this.loadListeners = [];
  this.resizeListeners = [];
}

Model.prototype.addBlockListener = function(fn) {
  this.blockListeners.push(fn);
}

Model.prototype.addLoadListener = function(fn) {
  this.loadListeners.push(fn);
}

Model.prototype.addResizeListener = function(fn) {
  this.resizeListeners.push(fn);
}

Model.prototype.clear = function() {
  this.initTypedArray();
}

Model.prototype.doneLoading = function() {
  var self = this;
  _.each(this.loadListeners, function(fn) {
    fn(self);
  });
}

// This function is unusual in that it can accept negative coordinates. For a negative
// coord, it always returns false.
Model.prototype.hasBlock = function(x, y, z) {
  if (x < 0 || y < 0 || z < 0) {
    return false;
  } else {
    return this.getBlock(x, y, z) != 0;
  }
}

Model.prototype.offsetAt = function(x, y, z, options) {
  if (typeof(options) == 'undefined') { options = {}; }
  if (options.size) {
    return (z * options.size.width * options.size.depth) + (y * options.size.width) + x;
  } else {
    return (z * this.width * this.depth) + (y * this.width) + x;
  }
}

// This function can accept coordinates outside the boundaries of the model, in which
// case it always returns zero.
Model.prototype.getBlock = function(x, y, z) {
  if (x < 0) { throw('Coords must not be negative. X was ' + x); }
  if (y < 0) { throw('Coords must not be negative. Y was ' + y); }
  if (z < 0) { throw('Coords must not be negative. Z was ' + z); }
  if (x > this.width - 1 || y > this.depth - 1 | z > this.height - 1) {
    return 0;
  } else {
    var offset = this.offsetAt(x, y, z);
    var blockId = this.blocks.getUint16(offset * 2);
    if (typeof(blockId) == 'undefined') {
      throw(
        'getBlock(' + x + ', ' + y + ', ' + z + '): Outside boundaries. w: ' + this.width +
        ', d: ' + this.depth + ', h: ' + this.height
      );
    }
    return blockId;
  }
}

Model.prototype.initTypedArray = function(options) {
  if (typeof(options) == 'undefined') { options = {}; }
  if (options.size) {
    this.blocksBuffer = new ArrayBuffer(2 * options.size.width * options.size.depth * options.size.height);
    //this.blocks = new Uint16Array(options.size.width * options.size.depth * options.size.height);
  } else {
    this.blocksBuffer = new ArrayBuffer(2 * this.width * this.depth * this.height);
    //this.blocks = new Uint16Array(this.width * this.depth * this.height);
  }
  this.blocks = new DataView(this.blocksBuffer);
}

Model.prototype.setBlock = function(x, y, z, blockId, options) {
  if (typeof(options) == 'undefined') { options = {}; }
  if (x < 0) { throw('Coords must not be negative. X was ' + x); }
  if (y < 0) { throw('Coords must not be negative. Y was ' + y); }
  if (z < 0) { throw('Coords must not be negative. Z was ' + z); }
  
  // Expand the typed array if necessary.
  if (x >= this.width || y >= this.depth || z >= this.height) {
    var newWidth = this.width;
    var newDepth = this.depth;
    var newHeight = this.height;
    if (x >= this.width) { newWidth = x + 1; }
    if (y >= this.depth) { newDepth = y + 1; }
    if (z >= this.height) { newHeight = z + 1; }
    var sizeOptions = {size: {width: newWidth, depth: newDepth, height: newHeight}};
    var tempBlocks = this.blocks;
    this.initTypedArray(sizeOptions);
    for (var iz = 0; iz < this.height; iz++) {
      for (var iy = 0; iy < this.depth; iy++) {
        for (var ix = 0; ix < this.width; ix++) {
          var oldOffset = this.offsetAt(ix, iy, iz);
          var oldBlockId = tempBlocks.getUint16(2 * oldOffset);
          var newOffset = this.offsetAt(ix, iy, iz, sizeOptions);
          this.blocks.setUint16(2 * newOffset, oldBlockId);
        }
      }
    }
    this.width = newWidth;
    this.depth = newDepth;
    this.height = newHeight;
  }
  // Set the new value in the typed array.
  var offset = this.offsetAt(x, y, z);
  if (offset >= this.blocks.length) {
    throw('Tried to set block at ' + offset + ' but length of typed array was ' + this.blocks.length);
  }
  this.blocks.setUint16(2 * offset, blockId);
  // If we're processing a batch update, e.g. when loading from a file, we can tell
  // setBlock not to trigger the block listener callbacks on every block update. In that
  // case, we must be sure to call doneLoading on the model.
  if (!options.skipListeners) {
    var self = this;
    _.each(this.blockListeners, function(fn) {
      fn(self, x, y, z, blockId);
    });
  }
}