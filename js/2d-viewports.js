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

function drawBackground(gl, bgAttribBuffer, bgProgram, bgAttribIndices, panI, panJ, zoom) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
  gl.useProgram(bgProgram);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, bgAttribBuffer);
  
  gl.uniform1f(bgAttribIndices.uPanI, panI);
  gl.uniform1f(bgAttribIndices.uPanJ, panJ);
  gl.uniform1f(bgAttribIndices.uZoom, zoom);
  gl.uniform1i(bgAttribIndices.uViewportW, gl.drawingBufferWidth);
  gl.uniform1i(bgAttribIndices.uViewportH, gl.drawingBufferHeight);
  
  gl.enableVertexAttribArray(bgAttribIndices.aPosition);
  gl.vertexAttribPointer(bgAttribIndices.aPosition, 2, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// When the registered events fire, the viewport object is updated. redrawFn is a callback
// that will be called any time an event requires the viewport to be redrawn.
function init2dViewportEvents(canvas, viewport, redrawFn) {
  canvas = $(canvas);
  canvas.bind('mousewheel DOMMouseScroll', function(event) {
    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
      viewport.zoom *= 1.03;
    }
    else {
      viewport.zoom /= 1.03;
    }
    event.preventDefault();
    redrawFn();
  });
  canvas.mousedown(function(event) {
    if (event.shiftKey) {
      viewport.lastMouseI = event.pageX;
      viewport.lastMouseJ = event.pageY;
      var mouseMoveHandler = $.throttle(16, function(event) {
        viewport.panI += (event.pageX - viewport.lastMouseI) * 0.01;
        viewport.panJ -= (event.pageY - viewport.lastMouseJ) * 0.01;
        viewport.lastMouseI = event.pageX;
        viewport.lastMouseJ = event.pageY;
        redrawFn();
      });
      $(window).mousemove(mouseMoveHandler);
      $(window).mouseup(function() {
        $(window).unbind('mousemove', mouseMoveHandler);
        delete viewport.lastMouseI;
        delete viewport.lastMouseJ;
      });
    }
  });
  
}

function init2dViewport(canvas) {
  var viewport = {panI: 0, panJ: 0, zoom: 0.1};
  
  var gl = initGl(canvas);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
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
  
  function redraw() {
    drawBackground(gl, bgAttribBuffer, bgProgram, bgAttribIndices, viewport.panI, viewport.panJ, viewport.zoom);
  }
  
  init2dViewportEvents(canvas, viewport, redraw);
  
  redraw();
}