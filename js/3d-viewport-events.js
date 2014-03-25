function init3dViewportEvents(canvas, viewport, redrawFn) {
  // Camera movement
  
  var canvas = $(canvas);
  var mouseX;
  var mouseY;
  var movingForward = false;
  var movingBack = false;
  var movingLeft = false;
  var movingRight = false;
  var movingUp = false;
  var movingDown = false;
  var lastTime;
  
  function animationLoop() {
    var time = new Date().getTime();
    var dt = time - (lastTime || time);
    lastTime = time;
    if (movingForward && !movingBack) {
      viewport.camX += dt * 0.01 * Math.cos(viewport.camPan);
      viewport.camY += dt * 0.01 * Math.sin(viewport.camPan);
    } else if (movingBack && !movingForward) {
      viewport.camX -= dt * 0.01 * Math.cos(viewport.camPan);
      viewport.camY -= dt * 0.01 * Math.sin(viewport.camPan);
    }
    if (movingLeft && !movingRight) {
      var angle = viewport.camPan - Math.PI / 2;
      viewport.camX -= dt * 0.01 * Math.cos(angle);
      viewport.camY -= dt * 0.01 * Math.sin(angle);
    } else if (movingRight && !movingLeft) {
      var angle = viewport.camPan - Math.PI / 2;
      viewport.camX += dt * 0.01 * Math.cos(angle);
      viewport.camY += dt * 0.01 * Math.sin(angle);
    }
    if (movingUp && !movingDown) {
      viewport.camZ += dt * 0.01;
    } else if (movingDown && ! movingUp) {
      viewport.camZ -= dt * 0.01;
    }
    
    redrawFn();
    
    if (movingForward || movingBack || movingRight || movingLeft || movingUp || movingDown) {
      requestAnimationFrame(animationLoop);
    } else {
      lastTime = null;
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
      case 16: // shift
        movingDown = true;
        animationLoop();
        break;
      case 32: // space
        event.preventDefault();
        movingUp = true;
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
    case 16: // shift
      movingDown = false;
      break;
    case 32: // space
      movingUp = false;
      break;
    }
  });
  
  var mouseMoveHandler = $.throttle(16, function(event) {
    viewport.camPan -= (event.pageX - viewport.lastMouseI) * 0.01;
    viewport.camPan = viewport.camPan % (2 * Math.PI);
    viewport.camTilt -= (event.pageY - viewport.lastMouseJ) * 0.01;
    if (viewport.camTilt > Math.PI / 2) {
      viewport.camTilt = Math.PI / 2;
    } else if (viewport.camTilt < Math.PI / -2) {
      viewport.camTilt = Math.PI / -2;
    }
    viewport.lastMouseI = event.pageX;
    viewport.lastMouseJ = event.pageY;
    redrawFn();
  });
  canvas.mousedown(function(event) {
    viewport.lastMouseI = event.pageX;
    viewport.lastMouseJ = event.pageY;
    $('body').css('cursor', 'none');
    $(window).mousemove(mouseMoveHandler);
    function mouseUpHandler() {
      $('body').css('cursor', 'default');
      $(window).unbind('mousemove', mouseMoveHandler);
      $(window).unbind('mouseup', mouseUpHandler);
      delete viewport.lastMouseI;
      delete viewport.lastMouseJ;
    }
    $(window).mouseup(mouseUpHandler);
  });
  
  // Reset view
  canvas.closest('div').find('input.reset-view').click(function() {
    viewport.camX = -7,
    viewport.camY =  -7,
    viewport.camZ = 10,
    viewport.camPan = Math.PI / 4,
    viewport.camTilt = -0.6,
    redrawFn();
  });
}