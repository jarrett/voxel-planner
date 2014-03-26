precision mediump float;

uniform float uPanI;
uniform float uPanJ;
uniform float uZoom;
uniform int uViewportW;
uniform int uViewportH;

// In clip space
attribute vec2 aPosition;

// In world space
varying vec2 vPosition;

void main() {
  gl_Position = vec4(aPosition, 0.5, 1.0);
  
  float aspect = float(uViewportW) / float(uViewportH);
  // Convert clip space to world space. The inverse of the world-to-screen transform.
  vPosition = vec2(
    ((aPosition.x + uPanI) / uZoom) * aspect,
    (aPosition.y + uPanJ) / uZoom
  );
}