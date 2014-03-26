// When the registered events fire, the viewport object is updated. redrawFn is a callback
// that will be called any time an event requires the viewport to be redrawn.
function init2dViewportEvents(canvas, viewport, redrawFn) {
  canvas = $(canvas);
  
  // Zooming
  canvas.bind('mousewheel DOMMouseScroll', $.throttle(16, function(event) {
    event.preventDefault();
    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
      viewport.zoom *= 1.06;
      if (viewport.zoom > 0.37) {
        viewport.zoom = 0.37;
      }
    }
    else {
      viewport.zoom /= 1.06;
      if (viewport.zoom < 0.022) {
        viewport.zoom = 0.022
      }
    }
    
    redrawFn();
  }));
  
  // Scrolling
  var mouseMoveHandler = $.throttle(16, function(event) {
    viewport.panI += (event.pageX - viewport.lastMouseI) * 0.01;
    viewport.panJ -= (event.pageY - viewport.lastMouseJ) * 0.01;
    viewport.lastMouseI = event.pageX;
    viewport.lastMouseJ = event.pageY;
    redrawFn();
  });
  
  canvas.mousedown(function(event) {
    if (event.shiftKey) {
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
    }
  });
  
  // Reset view
  canvas.closest('div').find('input.reset-view').click(function() {
    viewport.panI = 0;
    viewport.panJ = 0;
    viewport.zoom = 0.1;
    redrawFn();
  });
  
  // Drawing
  function leftClick(event) {
    var offset = canvas.offset();
    var i = event.pageX - offset.left;
    var j = event.pageY - offset.top;
    
  }
  
  function rightClick(event) {
    var offset = canvas.offset();
    var i = event.pageX - offset.left;
    var j = event.pageY - offset.top;
  }
  canvas.bind('contextmenu', function(event) {
    event.preventDefault();
    rightClick(event);
  });
  canvas.click(function(event) {
    if (event.which == 1) {
      leftClick(event);
    } else if (event.which == 2) {
      // Right mouse
      rightClick(event);
    }
  });
}