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

function draw2dBackground(gl, bgAttribBuffer, bgProgram, bgAttribIndices, viewport) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.useProgram(bgProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, bgAttribBuffer);
  set2dUniforms(gl, bgAttribIndices, viewport, 1.0);
  gl.enableVertexAttribArray(bgAttribIndices.aPosition);
  gl.vertexAttribPointer(bgAttribIndices.aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Call this after draw2dBackground so gl.viewport has already been called.
function draw2dForeground(gl, fgProgram, fgAttribIndices, viewport) {
  _.each(viewport.slices, function(slice, i) {
    gl.useProgram(fgProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, slice.attribBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, slice.indexBuffer);
    
    var opacity = (i == 0) ? 1.0 : 0.9;
    set2dUniforms(gl, fgAttribIndices, viewport, opacity);
    gl.enableVertexAttribArray(fgAttribIndices.aPosition);
    gl.vertexAttribPointer(fgAttribIndices.aPosition, 2, gl.FLOAT, false, 0, 0);
  
    gl.drawElements(gl.TRIANGLES, slice.vertexCount, gl.UNSIGNED_SHORT, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
}

function init2dModelListeners(gl, model, viewport, redraw) {
  model.addBlockListener(function(model, x, y, z, blockId) {
    _.each(viewport.slices, function(slice) {
      slice.rebuffer(gl, model);
    });
    redraw();
  });
  
  model.addLoadListener(function(model) {
    _.each(viewport.slices, function(slice) {
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
    k: 0
    // slices will be added later
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
    uViewportH: safeGetUniformLocation(gl, fgProgram, 'uViewportH'),
    uOpacity:   safeGetUniformLocation(gl, fgProgram, 'uOpacity')
  }
  
  var kAxis = $(canvas).closest('div').attr('data-k-axis');
  function initSlices() {
    if (viewport.slices) {
      _.each(viewport.slices, function(slice) {
        slice.free(gl);
      });
    }
    viewport.slices = [new Slice(kAxis, viewport.k)];
    viewport.slices[0].rebuffer(gl, Model.current);
    if (viewport.k > 0) {
      viewport.slices[1] = new Slice(kAxis, viewport.k - 1);
      viewport.slices[1].rebuffer(gl, Model.current);
    }
  }
  initSlices();
  
  // Events and drawing
  
  function redraw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    draw2dForeground(gl, fgProgram, fgAttribIndices, viewport);
    draw2dBackground(gl, bgAttribBuffer, bgProgram, bgAttribIndices, viewport);
  }
  
  init2dViewportEvents(canvas, viewport, Model.current, kAxis, redraw, initSlices);
  
  init2dModelListeners(gl, Model.current, viewport, redraw);
}

function set2dUniforms(gl, attribIndices, viewport, opacity) {
  gl.uniform1f(attribIndices.uPanI, viewport.panI);
  gl.uniform1f(attribIndices.uPanJ, viewport.panJ);
  gl.uniform1f(attribIndices.uZoom, viewport.zoom);
  gl.uniform1i(attribIndices.uViewportW, gl.drawingBufferWidth);
  gl.uniform1i(attribIndices.uViewportH, gl.drawingBufferHeight);
  gl.uniform1f(attribIndices.uOpacity, opacity);
}