uniform mat4 uProjection;
uniform mat4 uView;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  gl_Position = uProjection * uView * vec4(aPosition, 1.0);
  vPosition = aPosition;
  vNormal = aNormal;
}