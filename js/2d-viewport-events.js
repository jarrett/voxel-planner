// When the registered events fire, the viewport object is updated. redraw is a callback
// that will be called any time an event requires the viewport to be redrawn. initSlices
// is a callback that will be called when the viewport's current slices need to be updated.
function init2dViewportEvents(canvas, viewport, model, kAxis, redraw, initSlices) {
  canvas = $(canvas);
  var container = canvas.closest('div');
  
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
    
    redraw();
  }));
  
  // Panning
  var mouseMoveHandler = $.throttle(16, function(event) {
    viewport.panI -= (event.pageX - viewport.lastMouseI) * 0.01;
    viewport.panJ += (event.pageY - viewport.lastMouseJ) * 0.01;
    viewport.lastMouseI = event.pageX;
    viewport.lastMouseJ = event.pageY;
    redraw();
  });
  
  canvas.mousedown(function(event) {
    if (event.shiftKey) {
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
    }
  });
  
  // Reset view
  container.find('input.reset-view').click(function() {
    viewport.panI = 0;
    viewport.panJ = 0;
    viewport.zoom = 0.1;
    viewport.k = 0;
    redraw();
  });
  
  // Changing k values
  function updateKDisplay() {
    container.find('input.k').val(viewport.k);
  }
  updateKDisplay();
  
  function kTextFieldChange() {
    var newK = parseInt(container.find('input.k').val());
    if (!isNaN(newK)) {
      viewport.k = newK;
      initSlices();
      redraw();
    }
  }
  container.find('input.k').keyup(kTextFieldChange);
  
  function overK(fn) {
    var field = container.find('input.k');
    var currentK = parseInt(field.val());
    if (isNaN(currentK)) {
      field.val(0);
    } else {
      field.val(fn(currentK));
    }
    kTextFieldChange();
  }
  container.find('input.plus-k').click(function() {
    overK(function(k) { return k + 1; });
  });
  container.find('input.minus-k').click(function() {
    overK(function(k) {
      return (k - 1 < 0) ? k : k - 1;
    });
  });
  
  // Drawing
  function worldCoordsFromClick(event) {
    var offset = canvas.offset();
    // Get the i and j in OpenGL clip space.
    var halfW = canvas.width() / 2;
    var halfH = canvas.height() / 2;
    var i = ((event.pageX - offset.left) - halfW) / halfW;
    var j = (halfH - (event.pageY - offset.top)) / halfH;
    var aspect = canvas.width() / canvas.height();
    // This is similar to the transformation we use in our grid vertex shader.
    return {
      i: Math.floor(((i + viewport.panI) / viewport.zoom) * aspect),
      j: Math.floor((j + viewport.panJ) / viewport.zoom)
    };
  }
  
  function setBlock(i, j, blockId) {
    if (i >= 0 && j >= 0) {
      if (kAxis == 'x') {
        var y = i;
        var z = j;
        var x = viewport.k;
      } else if (kAxis == 'y') {
        var x = i;
        var z = j;
        var y = viewport.k;
      } else {
        var x = i;
        var y = j;
        var z = viewport.k;
      }
      model.setBlock(x, y, z, blockId);
    }
  }
  
  function leftClick(event) {
    var wCoords = worldCoordsFromClick(event);
    setBlock(wCoords.i, wCoords.j, 1);
  }
  
  function rightClick(event) {
    var wCoords = worldCoordsFromClick(event);
    setBlock(wCoords.i, wCoords.j, 0);
  }
  canvas.bind('contextmenu', function(event) {
    event.preventDefault();
    rightClick(event);
  });
  canvas.click(function(event) {
    if (!event.shiftKey) {
      if (event.which == 1) {
        leftClick(event);
      } else if (event.which == 2) {
        // Right mouse
        rightClick(event);
      }
    }
  });
}