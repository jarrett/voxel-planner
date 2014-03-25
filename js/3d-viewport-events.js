function init3dViewportEvents(canvas, viewport, redrawFn) {
  var canvas = $(canvas);
  var mouseX;
  var mouseY;
  var movingForward = false;
  var movingBack = false;
  var movingLeft = false;
  var movingRight = false;
  
  function animationLoop() {
    if (movingForward && !movingBack) {
      // do some trig stuff with viewport.camPan
    } else if (movingBack && !movingForward) {
      
    }
    if (movingLeft && !movingRight) {
      
    } else if (movingRight && !movingLeft) {
      
    }
    
    redrawFn();
    
    if (movingForward || movingBack || movingRight || movingLeft) {
      requestAnimationFrame(animationLoop);
    }
  }
  
  $(window).mousemove($.throttle(32, function(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
  }));
  
  $(window).keydown(function(event) {
    var offset = canvas.offset();
    if (
      mouseX >= offset.left && mouseX <= offset.left + canvas.width() &&
      mouseY >= offset.top && mouseY <= offset.top + canvas.height()
    ) {
      switch (event.keyCode) {
      case 87: // w
        movingForward = true;
        animationLoop();
        break;
      case 83: // s
        movingBack = true;
        animationLoop();
        break;
      case 65: // a
        movingLeft = true;
        animationLoop();
        break;
      case 68: // d
        movingRight = true;
        animationLoop();
        break;
      }
    }
  });
  
  $(window).keyup(function(event) {
    switch (event.keyCode) {
    case 87: // w
      movingForward = false;
      break;
    case 83: // s
      movingBack = false;
      break;
    case 65: // a
      movingLeft = false;
      break;
    case 68: // d
      movingRight = false;
      break;
    }
  });
  
  var mouseMoveHandler = $.throttle(16, function(event) {
    viewport.camPan += (event.pageX - viewport.lastMouseI) * 0.01;
    viewport.camTilt += (event.pageY - viewport.lastMouseJ) * 0.01;
    viewport.lastMouseI = event.pageX;
    viewport.lastMouseJ = event.pageY;
    redrawFn();
  });
  canvas.mousedown(function(event) {
    viewport.lastMouseI = event.pageX;
    viewport.lastMouseJ = event.pageY;
    $(window).mousemove(mouseMoveHandler);
    function mouseUpHandler() {
      $(window).unbind('mousemove', mouseMoveHandler);
      $(window).unbind('mouseup', mouseUpHandler);
      delete viewport.lastMouseI;
      delete viewport.lastMouseJ;
    }
    $(window).mouseup(mouseUpHandler);
  });
}