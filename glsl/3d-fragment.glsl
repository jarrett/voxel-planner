precision mediump float;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
  float lambert = dot(lightDir, vNormal);
  gl_FragColor = vec4(lambert * vec3(1.0, 1.0, 1.0), 1.0);
  //gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
}