// This class is actually part of the view, not the model.

function Slice(kAxis, k) {
  this.vertexCount = 0;
  this.k = k;
  this.kAxis = kAxis;
  if (kAxis == 'x') {
    this.iAxis = 'y';
    this.jAxis = 'z';
  } else if (kAxis == 'y') {
    this.iAxis = 'x';
    this.jAxis = 'z';
  } else {
    this.iAxis = 'x';
    this.jAxis = 'y';
  }
}

Slice.prototype.modelDim = function(model, axis) {
  if (axis == 'x') { return model.width; }
  if (axis == 'y') { return model.depth; }
  if (axis == 'z') { return model.height; }
}

Slice.prototype.rebuffer = function(gl, model) {
  if (!this.attribBuffer) { this.attribBuffer = gl.createBuffer(); }
  if (!this.indexBuffer) { this.indexBuffer = gl.createBuffer(); }
  
  // We could have initialized typed arrays here instead of starting with boxed ones. But
  // typed arrays have to be initialized with a size, and growing them is expensive.
  // Initializing arrays to the maximum polygon count for a chunk would be grossly
  // inefficient. So I think this is the best way.
  var attribData = [];
  var indexData = [];
  
  this.vertexCount = 0;
  
  for (var i = 0; i < this.modelDim(model, this.iAxis); i++) {
    for (var j = 0; j < this.modelDim(model, this.jAxis); j++) {
      if (this.kAxis == 'x') {
        var y = i;
        var z = j;
        var x = this.k;
      } else if (this.kAxis == 'y') {
        var x = i;
        var z = j;
        var y = this.k;
      } else {
        var x = i;
        var y = j;
        var z = this.k
      }
      var blockId = model.getBlock(x, y, z);
      if (blockId != 0) {
        var idx = attribData.length / 2; // 2 scalar values per vertex
        attribData.push(
          i - 0.5, j + 0.5,   i - 0.5, j - 0.5,
          i + 0.5, j - 0.5,   i + 0.5, j + 0.5
          /*-1,  1,   -1,  -1,
           1, -1,    1,   1  */
        );
        indexData.push(
          idx, idx + 1, idx + 2,
          idx, idx + 2, idx + 3
        );
        this.vertexCount += 6;
      }
    }
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.attribBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attribData), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}