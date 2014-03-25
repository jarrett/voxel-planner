uniform mat4 uCamera;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  gl_Position = uCamera * vec4(aPosition, 1.0);
  //gl_Position = vec4(0.1 * aPosition, 1.0);
  vPosition = aPosition;
  vNormal = aNormal;
}