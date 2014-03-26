precision mediump float;

uniform float uOpacity;

varying vec2 vPosition;

void main() {
  gl_FragColor = vec4(0.67, 0.82, 1.0, uOpacity);
}