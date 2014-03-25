// This class is actually part of the view, not the model. Its array ordering is the same
// as in the Model class.

// This does not call rebuffer.
Chunk = function(minX, minY, minZ) {
  this.minX = minX;
  this.maxX = minX + 11;
  this.minY = minY;
  this.maxY = minY + 11;
  this.minZ = minZ;
  this.maxZ = minZ + 11;
  
  this.vertexCount = 0;
}

/*  chunks is an object like this:
    {24:         // x coord
      {16:       // y coord
        {12:     // z coord
          chunk  // Instance of class Chunk
        }
      }
    }
    The x, y, and z coords are the chunk's minima. That does *not* mean the value closest
    to zero. So for a negative coord, the minimum is *more negative* than the coord. That
    being said, at the moment we don't allow negative coords. (0, 0, 0) is always the
    model's minimum.
*/
Chunk.atCoord = function(chunks, x, y, z) {
  var mX = Chunk.minimum(x);
  var mY = Chunk.minimum(y);
  var mZ = Chunk.minimum(z);
  if (chunks[mX] && chunks[mX][mY] && chunks[mX][mY][mZ]) {
    return chunks[mX][mY][mZ];
  } else {
    throw(
      'Tried to access chunk for coord (' + x + ', ' + y + ', ' + z + ')' +
      ' with chunk minima (' + mX + ', ' + mY + ', ' + mZ + '), but no chunk was found.'
    );
  }
}

// Writes to arrays in client memory, not on the GPU. Write the indices for a triangle strip.
Chunk.prototype.bufferFace = function(attribData, indexData, nx, ny, nz, x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
  var i = attribData.length / 6;
  attribData.push(
    x0, y0, z0, nx, ny, nz,
    x1, y1, z1, nx, ny, nz,
    x2, y2, z2, nx, ny, nz,
    x3, y3, z3, nx, ny, nz
  );
  indexData.push(
    i, i + 1, i + 2,
    i, i + 2, i + 3
  );
}

// For a description of the format of chunks, see Chunk.atCoord.
Chunk.ensureExistsAtCoord = function(chunks, x, y, z) {
  var mX = Chunk.minimum(x);
  var mY = Chunk.minimum(y);
  var mZ = Chunk.minimum(z);
  if (!chunks[mX]) { chunks[mX] = {}; }
  if (!chunks[mX][mY]) { chunks[mX][mY] = {}; }
  if (!chunks[mX][mY][mZ]) {
    chunks[mX][mY][mZ] = new Chunk(x, y, z);
  }
  return chunks[mX][mY][mZ];
}


// Be sure to clear, set the viewport, and use the shader program before calling this.
Chunk.prototype.draw = function(gl, attribIndices, camera) {
  if (!this.attribBuffer || !this.indexBuffer) {
    throw(
      'Expected this.attribBuffer and this.indexBuffer to be initialized, but at' +
      ' least one was not. Call rebuffer before calling draw.'
    );
  }
  
  gl.uniformMatrix4fv(attribIndices.uCamera, false, camera);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.attribBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  
  gl.enableVertexAttribArray(attribIndices.aPosition);
  gl.vertexAttribPointer(attribIndices.aPosition, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(attribIndices.aNormal);
  gl.vertexAttribPointer(attribIndices.aNormal, 3, gl.FLOAT, false, 24, 12);
  
  gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

Chunk.minimum = function(coord) {
  return 12 * Math.floor(coord / 12);
}

// Reads data from the model and rebuffers the attribute and index buffers.
Chunk.prototype.rebuffer = function(gl, model) {  
  if (!this.attribBuffer) { this.attribBuffer = gl.createBuffer(); }
  if (!this.indexBuffer) { this.indexBuffer = gl.createBuffer(); }
  
  // We could have initialized typed arrays here instead of starting with boxed ones. But
  // typed arrays have to be initialized with a size, and growing them is expensive.
  // Initializing arrays to the maximum polygon count for a chunk would be grossly
  // inefficient. So I think this is the best way.
  var attribData = [];
  var indexData = [];
  
  this.vertexCount = 0;
  
  for (var z = this.minZ; z <= this.maxZ; z++) {
    for (var y = this.minY; y <= this.maxY; y++) {
      for (var x = this.minX; x <= this.maxX; x++) {
        var blockId = model.getBlock(x, y, z);
        if (blockId != 0) {
          // Find the corners of this block. Integral coordinates are always at the center
          // of a block, so the corners are at +/- 0.5.
          var posX = x + 0.5;
          var negX = x - 0.5;
          var posY = y + 0.5;
          var negY = y - 0.5;
          var posZ = z + 0.5;
          var negZ = z - 0.5;
          
          // Determine which of the adjacent blocks is occupied. A face will not be buffered
          // if it is occluded by an adjacent block.
          if (!model.hasBlock(x, y, z + 1)) {
            // Not occluded in the positive Z direction.
            this.bufferFace(
              attribData, indexData,  0,  0,  1,
              negX, posY, posZ,   negX, negY, posZ,   posX, negY, posZ,   posX, posY, posZ
            );
            this.vertexCount += 6;
          }
          if (!model.hasBlock(x, y, z - 1)) {
            // Not occluded in the negative Z direction.
            this.bufferFace(
              attribData, indexData,  0,  0, -1,
              negX, posY, negZ,   posX, posY, negZ,   posX, negY, negZ,   negX, negY, negZ
            );
            this.vertexCount += 6;
          }
          if (!model.hasBlock(x + 1, y, z)) {
            // Not occluded in the positive X direction.
            this.bufferFace(
              attribData, indexData,  1,  0,  0,
              posX, negY, posZ,   posX, negY, negZ,   posX, posY, negZ,   posX, posY, posZ
            );
            this.vertexCount += 6;
          }
          if (!model.hasBlock(x - 1, y, z)) {
            // Not occluded in the negative X direction.
            this.bufferFace(
              attribData, indexData, -1,  0,  0,
              negX, negY, posZ,   negX, posY, posZ,   negX, posY, negZ,   negX, negY, negZ
            );
            this.vertexCount += 6;
          }
          if (!model.hasBlock(x, y + 1, z)) {
            // Not occluded in the positive Y direction.
            this.bufferFace(
              attribData, indexData,  0,  1,  0,
              negX, posY, posZ,   posX, posY, posZ,   posX, posY, negZ,   negX, posY, negZ
            );
            this.vertexCount += 6;
          }
          if (!model.hasBlock(x, y - 1, z)) {
            // Not occluded in the negative Y direction.
            this.bufferFace(
              attribData, indexData,  0, -1,  0,
              negX, negY, posZ,   negX, negY, negZ,   posX, negY, negZ,   posX, negY, posZ
            );
            this.vertexCount += 6;
          }
        }
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