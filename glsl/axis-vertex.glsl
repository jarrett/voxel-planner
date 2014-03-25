uniform mat4 uProjection;
uniform mat4 uView;

attribute vec3 aPosition;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
  gl_Position = uProjection * uView * vec4(aPosition, 1.0);
  vColor = aColor;
}