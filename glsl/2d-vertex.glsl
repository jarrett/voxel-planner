uniform float uPanI;
uniform float uPanJ;
uniform float uZoom;
uniform int uViewportW;
uniform int uViewportH;

attribute vec2 aPosition;

varying vec2 vPosition;

void main() {
  gl_Position = vec4(aPosition * 0.2, 0.0, 1.0);
  vPosition = aPosition;
}