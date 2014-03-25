precision mediump float;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // 0 degrees
  vec3 light1Pos = normalize(vec3(1.0, 0.0, 0.7));
  // 120 degrees
  vec3 light2Pos = normalize(vec3(-0.5, 0.8, 0.7));
  // 240 degrres
  vec3 light3Pos = normalize(vec3(-0.5, -0.8, 0.7));
  float lambert = min(
    1.0,
    max(0.0, dot(light1Pos, vNormal)) * 0.7 +
    max(0.0, dot(light2Pos, vNormal)) * 0.7 +
    max(0.0, dot(light3Pos, vNormal)) * 0.7
  );
  gl_FragColor = vec4(lambert * vec3(0.5, 0.8, 1.0), 1.0);
}