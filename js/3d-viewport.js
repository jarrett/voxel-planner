function drawAxes(gl, program, attribIndices, attribBuffer, camera) {
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer);
  
  gl.uniformMatrix4fv(attribIndices.uCamera, false, camera);
  
  gl.enableVertexAttribArray(attribIndices.aPosition);
  gl.vertexAttribPointer(attribIndices.aPosition, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(attribIndices.aColor);
  gl.vertexAttribPointer(attribIndices.aColor, 3, gl.FLOAT, false, 24, 12);
  
  gl.drawArrays(gl.LINES, 0, 6);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function draw3dViewport(gl, program, attribIndices, viewport, chunks) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var camera = mat4.create();
  mat4.perspective(camera, 45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1024);
  mat4.translate(camera, camera, [-1 * viewport.camX, -1 * viewport.camY, -1 * viewport.camZ]);
  // In OpenGL's clip space, the Z axis is normal to the screen. But in our coordinate
  // system, we prefer to refer to a camera looking along (x, y, 0) as having tilt 0.
  // Therefore, we must convert between those two coordinate systems.
  mat4.rotateZ(camera, camera, viewport.camPan);
  mat4.rotateX(camera, camera, viewport.camTilt + (Math.PI / 2));
  
  gl.useProgram(program);
  for (var x in chunks) {
    for (var y in chunks[x]) {
      for (var z in chunks[x][y]) {
        chunks[x][y][z].draw(gl, attribIndices, camera);
      }
    }
  }
  
  drawAxes(gl, viewport.axes.program, viewport.axes.attribIndices, viewport.axes.attribBuffer, camera);
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
    aPosition: safeGetAttribLocation( gl, program, 'aPosition'),
    aNormal:   safeGetAttribLocation( gl, program, 'aNormal'),
    uCamera:   safeGetUniformLocation(gl, program, 'uCamera')
  };
  
  var viewport = {
    camX: 2,
    camY: 2,
    camZ: 10,
    camPan: 0,
    camTilt: 0,
    axes: initAxes(gl)
  };
  
  // See Chunk.atCoord for a description of this object's format.
  var chunks = {};
  
  // Later, we may want to do something more sophisticated than storing the current
  // model in a static variable.
  initModelListeners(gl, program, attribIndices, viewport, Model.current, chunks);
  
  init3dViewportEvents(canvas, viewport, function() {
    draw3dViewport(gl, program, attribIndices, viewport, chunks);
  });
  
  /*setInterval(function() {
    draw3dViewport(gl, program, attribIndices, viewport, chunks);
  }, 1000);*/
}

function init3dViewportEvents(canvas, viewport, redrawFn) {
  var canvas = $(canvas);
  var mouseX;
  var mouseY;
  $(window).mousemove($.throttle(32, function(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
  }));
  $(window).keydown(function(event) {
    var offset = canvas.offset()
    if (
      mouseX >= offset.left && mouseX <= offset.left + canvas.width() &&
      mouseY >= offset.top && mouseY <= offset.top + canvas.height()
    ) {
      switch (event.keycode) {
      case 87: // w
        break;
      case 83: // s
        break;
      case 65: // a
        break;
      case 68: // d
        break;
      }
    }
  });
}

function initAxes(gl) {
  var attribBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Position       // Color
      0.0, 0.0, 0.0,    1.0, 0.0, 0.0,
      10.0, 0.0, 0.0,    1.0, 0.0, 0.0,
      
      0.0, 0.0, 0.0,    0.0, 1.0, 0.0,
      0.0, 10.0, 0.0,    0.0, 1.0, 0.0,
      
      0.0, 0.0, 0.0,    0.0, 0.0, 1.0,
      0.0, 0.0, 10.0,    0.0, 0.0, 1.0,
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
      aPosition:    safeGetAttribLocation( gl, program, 'aPosition'),
      aColor:       safeGetAttribLocation( gl, program, 'aColor'),
      uCamera:      safeGetUniformLocation(gl, program, 'uCamera')
    }
  };
}

function initModelListeners(gl, program, attribIndices, viewport, model, chunks) {
  model.addBlockListener(function(model, x, y, z, blockId) {
    // The chunk will rebuffer in its entirety, using the references to the GL context
    // and the model that we pass in. We can ignore the blockId param.
    var chunk = Chunk.ensureExistsAtCoord(chunks, x, y, z);
    chunk.rebuffer(gl, model);
    
    draw3dViewport(gl, program, attribIndices, viewport, chunks);
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
    draw3dViewport(gl, program, attribIndices, viewport, chunks);
  });
  
  model.addResizeListener(function(model, w, d, h) {
    draw3dViewport(gl, program, attribIndices, viewport, chunks);
  });
}
