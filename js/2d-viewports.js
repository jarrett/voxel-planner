function bufferBackground(gl, bgAttribBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, bgAttribBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1,  1,    -1, -1,    1,  1,
      -1, -1,     1, -1,    1,  1
    ]),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawBackground(gl, bgAttribBuffer, bgProgram, bgAttribIndices, viewport) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.useProgram(bgProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, bgAttribBuffer);
  set2dUniforms(gl, bgAttribIndices, viewport);
  gl.enableVertexAttribArray(bgAttribIndices.aPosition);
  gl.vertexAttribPointer(bgAttribIndices.aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Call this after drawBackground so gl.viewport has already been called. The foreground
// will always render in front because the background vertex shader draws everything at
// z = 0.5. The foreground vertex shader draws everything at z = 0;
function drawForeground(gl, fgProgram, fgAttribIndices, viewport, slice) {
  gl.useProgram(fgProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, slice.attribBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, slice.indexBuffer);
  
  set2dUniforms(gl, fgAttribIndices, viewport);
  gl.enableVertexAttribArray(fgAttribIndices.aPosition);
  gl.vertexAttribPointer(fgAttribIndices.aPosition, 2, gl.FLOAT, false, 0, 0);
  
  gl.drawElements(gl.TRIANGLES, slice.vertexCount, gl.UNSIGNED_SHORT, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function init2dModelListeners(gl, model, slices, redraw) {
  model.addBlockListener(function(model, x, y, z, blockId) {
    _.each(slices, function(slice) {
      slice.rebuffer(gl, model);
    });
    redraw();
  });
  
  model.addLoadListener(function(model) {
    _.each(slices, function(slice) {
      slice.rebuffer(gl, model);
    });
    redraw();
  });
  
  model.addResizeListener(function(model, w, d, h) {
    redraw();
  });
}

function init2dViewport(canvas) {
  var viewport = {
    panI: 0,
    panJ: 0,
    zoom: 0.1,
    depth: 0
  };
  
  var gl = initGl(canvas);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Grid background
  
  var bgVertexShader = compileShader(gl, 'grid-bg-vertex', gl.VERTEX_SHADER);
  var bgFragmentShader = compileShader(gl, 'grid-bg-fragment', gl.FRAGMENT_SHADER);
  
  var bgProgram = createProgram(gl, bgVertexShader, bgFragmentShader);
  gl.useProgram(bgProgram);
  var bgAttribIndices = {
    aPosition:  safeGetAttribLocation( gl, bgProgram, 'aPosition'),
    uPanI:      safeGetUniformLocation(gl, bgProgram, 'uPanI'),
    uPanJ:      safeGetUniformLocation(gl, bgProgram, 'uPanJ'),
    uZoom:      safeGetUniformLocation(gl, bgProgram, 'uZoom'),
    uViewportW: safeGetUniformLocation(gl, bgProgram, 'uViewportW'),
    uViewportH: safeGetUniformLocation(gl, bgProgram, 'uViewportH')
  }
  
  var bgAttribBuffer = gl.createBuffer();
  bufferBackground(gl, bgAttribBuffer);
  
  // Foreground
  
  var fgVertexShader = compileShader(gl, '2d-vertex', gl.VERTEX_SHADER);
  var fgFragmentShader = compileShader(gl, '2d-fragment', gl.FRAGMENT_SHADER);

  var fgProgram = createProgram(gl, fgVertexShader, fgFragmentShader);
  gl.useProgram(fgProgram);
  var fgAttribIndices = {
    aPosition:  safeGetAttribLocation( gl, fgProgram, 'aPosition'),
    uPanI:      safeGetUniformLocation(gl, fgProgram, 'uPanI'),
    uPanJ:      safeGetUniformLocation(gl, fgProgram, 'uPanJ'),
    uZoom:      safeGetUniformLocation(gl, fgProgram, 'uZoom'),
    uViewportW: safeGetUniformLocation(gl, fgProgram, 'uViewportW'),
    uViewportH: safeGetUniformLocation(gl, fgProgram, 'uViewportH')
  }
  
  var kAxis = $(canvas).closest('div').attr('data-k-axis');
  var slice0 = new Slice(kAxis, 0);
  slice0.rebuffer(gl, Model.current);
  
  // Events and drawing
  
  function redraw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawBackground(gl, bgAttribBuffer, bgProgram, bgAttribIndices, viewport);
    drawForeground(gl, fgProgram, fgAttribIndices, viewport, slice0);
  }
  
  init2dViewportEvents(canvas, viewport, redraw);
  
  init2dModelListeners(gl, Model.current, [slice0], redraw);
}

function set2dUniforms(gl, attribIndices, viewport) {
  gl.uniform1f(attribIndices.uPanI, viewport.panI);
  gl.uniform1f(attribIndices.uPanJ, viewport.panJ);
  gl.uniform1f(attribIndices.uZoom, viewport.zoom);
  gl.uniform1i(attribIndices.uViewportW, gl.drawingBufferWidth);
  gl.uniform1i(attribIndices.uViewportH, gl.drawingBufferHeight);
}