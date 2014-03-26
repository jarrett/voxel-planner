function drawAxes(gl, program, attribIndices, attribBuffer, projection, view) {
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer);
  
  gl.uniformMatrix4fv(attribIndices.uProjection, false, projection);
  gl.uniformMatrix4fv(attribIndices.uView, false, view);
  
  gl.enableVertexAttribArray(attribIndices.aPosition);
  gl.vertexAttribPointer(attribIndices.aPosition, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(attribIndices.aColor);
  gl.vertexAttribPointer(attribIndices.aColor, 3, gl.FLOAT, false, 24, 12);
  
  gl.drawArrays(gl.LINES, 0, 6);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function draw3dViewport(gl, program, attribIndices, viewport, projection, chunks) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var view = viewMatrix3d(viewport);
  
  gl.useProgram(program);
  for (var x in chunks) {
    for (var y in chunks[x]) {
      for (var z in chunks[x][y]) {
        chunks[x][y][z].draw(gl, attribIndices, projection, view);
      }
    }
  }
  
  drawAxes(gl, viewport.axes.program, viewport.axes.attribIndices, viewport.axes.attribBuffer, projection, view);
}

function init3dModelListeners(gl, model, chunks, redraw) {  
  model.addBlockListener(function(model, x, y, z, blockId) {
    // The chunk will rebuffer in its entirety, using the references to the GL context
    // and the model that we pass in. We can ignore the blockId param.
    var chunk = Chunk.ensureExistsAtCoord(chunks, x, y, z);
    chunk.rebuffer(gl, model);
    
    // Rebuffer the adjacent chunk if the block is on the edge of a chunk.
    if (x % 12 == 0) {
      adjChunk = Chunk.atCoord(chunks, x - 1, y, z);
      if (adjChunk) {
        adjChunk.rebuffer(gl, model);
      }
    } else if (x % 12 == 11) {
      adjChunk = Chunk.atCoord(chunks, x + 1, y, z);
      if (adjChunk) {
        adjChunk.rebuffer(gl, model);
      }
    }
    if (y % 12 == 0) {
      adjChunk = Chunk.atCoord(chunks, x, y - 1, z);
      if (adjChunk) {
        adjChunk.rebuffer(gl, model);
      }
    } else if (y % 12 == 11) {
      adjChunk = Chunk.atCoord(chunks, x, y + 1, z);
      if (adjChunk) {
        adjChunk.rebuffer(gl, model);
      }
    }
    if (z % 12 == 0) {
      adjChunk = Chunk.atCoord(chunks, x, y, z - 1);
      if (adjChunk) {
        adjChunk.rebuffer(gl, model);
      }
    } else if (z % 12 == 11) {
      adjChunk = Chunk.atCoord(chunks, x, y, z + 1);
      if (adjChunk) {
        adjChunk.rebuffer(gl, model);
      }
    }
    
    redraw();
  });
  
  model.addLoadListener(function(model) {
    for (var z = 0; z < model.height; z+= 12) {
      for (var y = 0; y < model.depth; y+= 12) { 
        for (var x = 0; x < model.width; x += 12) {
          var chunk = Chunk.ensureExistsAtCoord(chunks, x, y, z);
          chunk.rebuffer(gl, model);
        }
      }
    }
    
    redraw();
  });
  
  model.addResizeListener(function(model, w, d, h) {
    redraw();
  });
}

function init3dViewport() {
  /* TODO: Break the world up into 12 x 12 x 12 chunks. That's the maximum even size we
  can address in an index buffer (12^3 * 4 * 6) = 41472. Each chunk gets its own buffers.
  When updating a block, we simply rebuffer any dirty chunks in their entirety. The chunk
  containing the updated block is obviously dirty. If the block is on the boundary of a
  chunk, then the adjacent chunk(s) are dirty as well. */
  
  var canvas = $('canvas#top-left').get()[0];
  var gl = initGl(canvas);
  
  var vertexShader = compileShader(gl, '3d-vertex', gl.VERTEX_SHADER);
  var fragmentShader = compileShader(gl, '3d-fragment', gl.FRAGMENT_SHADER);
  
  var program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);
  
  var attribIndices = {
    aPosition:   safeGetAttribLocation( gl, program, 'aPosition'),
    aNormal:     safeGetAttribLocation( gl, program, 'aNormal'),
    uProjection: safeGetUniformLocation(gl, program, 'uProjection'),
    uView:       safeGetUniformLocation(gl, program, 'uView'),
  };
  
  var viewport = {
    camX: -7,
    camY: -7,
    camZ: 10,
    
    camPan: Math.PI / 4,
    camTilt: -0.6,
    axes: init3dAxes(gl)
  };
  
  var projection = mat4.create();
  mat4.perspective(projection, 45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1024);
  
  // See Chunk.atCoord for a description of this object's format.
  var chunks = {};
  
  function redraw() {
    draw3dViewport(gl, program, attribIndices, viewport, projection, chunks);
  }
  
  // Later, we may want to do something more sophisticated than storing the current
  // model in a static variable.
  //init3dModelListeners(gl, program, attribIndices, viewport, projection, Model.current, chunks);
  init3dModelListeners(gl, Model.current, chunks, redraw);
  
  /*init3dViewportEvents(canvas, viewport, function() {
    draw3dViewport(gl, program, attribIndices, viewport, projection, chunks);
  });*/
  init3dViewportEvents(canvas, viewport, redraw);
}

function init3dAxes(gl) {
  var attribBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Position       // Color
      0.0, 0.0, 0.0,    1.0, 0.0, 0.0,
      5.0, 0.0, 0.0,    1.0, 0.0, 0.0,
      
      0.0, 0.0, 0.0,    0.0, 1.0, 0.0,
      0.0, 5.0, 0.0,    0.0, 1.0, 0.0,
      
      0.0, 0.0, 0.0,    0.0, 0.0, 1.0,
      0.0, 0.0, 5.0,    0.0, 0.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  var vertexShader = compileShader(gl, 'axis-vertex', gl.VERTEX_SHADER);
  var fragmentShader = compileShader(gl, 'axis-fragment', gl.FRAGMENT_SHADER);
  
  var program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);
  return {
    program:       program,
    attribBuffer:  attribBuffer,
    attribIndices: {
      aPosition:   safeGetAttribLocation( gl, program, 'aPosition'),
      aColor:      safeGetAttribLocation( gl, program, 'aColor'),
      uProjection: safeGetUniformLocation(gl, program, 'uProjection'),
      uView:       safeGetUniformLocation(gl, program, 'uView')
    }
  };
}

function viewMatrix3d(viewport) {
  var camDir = [
    Math.cos(viewport.camPan) * Math.cos(viewport.camTilt),
    Math.sin(viewport.camPan) * Math.cos(viewport.camTilt),
    Math.sin(viewport.camTilt)
  ];
  var camTarget = [
    camDir[0] + viewport.camX,
    camDir[1] + viewport.camY,
    camDir[2] + viewport.camZ
  ];
  var view = mat4.create();
  mat4.lookAt(
    view,
    [viewport.camX, viewport.camY, viewport.camZ],
    camTarget,
    [0, 0, 1]
  );
  return view;
}