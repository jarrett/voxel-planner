// Pass in a reference to a canvas DOM element (not a jQuery object). Returns an
// OpenGL context, i.e. the object you typically assign to the gl variable.
// 
// Performs some basic GL configs that we need in all our viewports.
function initGl(canvas) {
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  return gl;
}