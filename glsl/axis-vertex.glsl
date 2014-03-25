uniform mat4 uCamera;

attribute vec3 aPosition;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
  gl_Position = uCamera * vec4(aPosition, 1.0);
  //gl_Position = vec4(aPosition, 1.0);
  vColor = aColor;
}